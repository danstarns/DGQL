import {
  DirectiveNode,
  DocumentNode,
  valueFromASTUntyped,
  visit,
  locatedError,
} from "graphql";

function filterDocumentWithConditionalSelection({
  document,
  variables,
}: {
  document: DocumentNode;
  variables: any;
}): DocumentNode {
  const edited = visit(document, {
    enter(node, key, parent, path) {
      if (node.kind !== "Field") {
        return;
      }

      const directives = node?.directives as undefined | DirectiveNode[];

      if (!directives || !Array.isArray(directives)) {
        return;
      }

      let hasSeen = false;
      let includeValue = true;

      ["skip", "include"].forEach((type) => {
        const found = directives.find((x) => x.name.value === type);

        if (!found) {
          return;
        }

        if (hasSeen) {
          const error = locatedError(
            "cannot @skip and @include at the same time",
            found,
            path
          );

          throw error;
        }

        hasSeen = true;

        const ifArg = found.arguments?.find((x) => x.name.value === "if");

        if (!ifArg) {
          const error = locatedError(
            `directive argument: @${type}(if: ) required`,
            found,
            path
          );

          throw error;
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
          ...node,
          directives: [
            ...((node?.directives || []) as DirectiveNode[]).filter(
              (x) => !["skip", "include"].includes(x.name.value)
            ),
          ],
        };
      } else {
        // delete this node
        return null;
      }
    },
  });

  return edited;
}

export default filterDocumentWithConditionalSelection;
