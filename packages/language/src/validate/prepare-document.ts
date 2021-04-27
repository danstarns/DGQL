import {
  DirectiveNode,
  DocumentNode,
  valueFromASTUntyped,
  visit,
  locatedError,
  FragmentDefinitionNode,
} from "graphql";

function prepareDocument({
  document,
  variables,
}: {
  document: DocumentNode;
  variables: any;
}): DocumentNode {
  const edited = visit(document, {
    enter(node, key, parent, path) {
      if (node.kind === "FragmentDefinition") {
        const isOnDGQL = node.typeCondition.name.value === "DGQL";

        if (!isOnDGQL) {
          const error = locatedError("fragment not on DGQL", node, path);

          throw error;
        }

        return null;
      }

      if (node.kind !== "Field") {
        return;
      }

      if (node.selectionSet?.selections.length) {
        node.selectionSet.selections.forEach((select, i) => {
          if (select.kind !== "FragmentSpread") {
            return;
          }

          const found = document.definitions.find(
            (x) =>
              x.kind === "FragmentDefinition" &&
              x.name.value === select.name.value
          ) as FragmentDefinitionNode;

          if (!found) {
            const error = locatedError(
              `fragment ${select.name.value} not found`,
              select,
              path
            );

            throw error;
          }

          // @ts-ignore
          node.selectionSet?.selections[i] = null;
          // @ts-ignore
          node.selectionSet?.selections = [
            ...(node.selectionSet?.selections || []),
            ...(found.selectionSet.selections || []),
          ].filter((x) => x !== null);
        });
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

export default prepareDocument;
