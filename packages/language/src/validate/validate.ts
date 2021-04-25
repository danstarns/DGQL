import {
  DocumentNode,
  DirectiveNode,
  valueFromASTUntyped,
  visit,
  OperationDefinitionNode,
  locatedError,
  GraphQLError,
  printError,
} from "graphql";

/*
    Validates DGQL query and filters out @skip & @limit.
    Filtering out skip and limit here means when we translate 
    we don't need to concern ourself about it everywhere. 
    Returns a new document and variables. 
    Throws Error Or GraphQLError.
*/
function validate({
  document,
  variables,
  shouldPrintError,
}: {
  document: DocumentNode;
  variables: any;
  shouldPrintError?: boolean;
}): { document: DocumentNode; variables: any } {
  function enter(node, key, parent, path) {
    if (node.kind === "Document") {
      return;
    }

    const directives = node?.directives as undefined | DirectiveNode[];

    if (directives) {
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
        node.directives = [
          ...((node?.directives || []) as DirectiveNode[]).filter(
            (x) => !["skip", "include"].includes(x.name.value)
          ),
        ];
      } else {
        // delete this node
        return null;
      }
    }

    if (node.kind === "OperationDefinition") {
      const root = document.definitions[0] as OperationDefinitionNode;
      const selectionSet = root.selectionSet;

      selectionSet.selections.forEach((selection) => {
        if (selection.kind !== "Field") {
          const error = locatedError(
            "Fields are only supported here",
            selection,
            path
          );

          throw error;
        }

        const validSelections = [
          "MATCH",
          "CREATE",
          "UPDATE",
          "DELETE",
          "RETURN",
        ];

        if (!validSelections.includes(selection.name.value)) {
          const error = locatedError(
            `Invalid operation: ${
              selection.name.value
            }. Use one of ${validSelections.join(", ")}`,
            selection,
            path
          );

          throw error;
        }
      });
    }
  }

  try {
    const edited = visit(document, {
      enter,
    });

    return { document: edited, variables };
  } catch (error) {
    if (error instanceof GraphQLError) {
      if (shouldPrintError) {
        throw new Error(printError(error));
      }
    }

    throw error;
  }
}

export default validate;
