import { DirectiveNode, DocumentNode, valueFromASTUntyped } from "graphql";

function filterDocumentWithConditionalSelection({
  document,
  variables,
}: {
  document: DocumentNode;
  variables: any;
}): DocumentNode {
  function replacer(key: any, value: any): any {
    if (value === undefined) {
      return undefined;
    }

    if (["string", "boolean", "number"].includes(typeof value)) {
      return value;
    }

    const directives = value?.directives as undefined | DirectiveNode[];

    if (!directives || !Array.isArray(directives)) {
      return value;
    }

    let hasSeen = false;
    let includeValue = true;

    ["skip", "include"].forEach((type) => {
      const found = directives.find((x) => x.name.value === type);

      if (!found) {
        return;
      }

      if (hasSeen) {
        throw new Error("cannot @skip and @include at the same time");
      }

      hasSeen = true;

      const ifArg = found.arguments?.find((x) => x.name.value === "if");

      if (!ifArg) {
        throw new Error(`directive argument: @${type}(if: ) required`);
      }

      const ifValue = valueFromASTUntyped(ifArg.value, variables);

      if (type === "skip") {
        if (ifValue) {
          includeValue = false;
        }
      }

      if (type === "include") {
        if (!ifValue) {
          includeValue = false;
        }
      }
    });

    if (includeValue) {
      return {
        ...value,
        directives: [
          ...((value?.directives || []) as DirectiveNode[]).filter(
            (x) => !["skip", "include"].includes(x.name.value)
          ),
        ],
      };
    } else {
      return undefined;
    }
  }

  // TODO remove extra iteration - something wrong with this
  return JSON.parse(
    JSON.stringify(JSON.parse(JSON.stringify(document, replacer)), (key, v) => {
      if (key === "selections") {
        return v.filter(Boolean);
      }

      return v;
    })
  ) as DocumentNode;
}

export default filterDocumentWithConditionalSelection;
