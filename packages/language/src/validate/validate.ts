import {
  DocumentNode,
  visit,
  OperationDefinitionNode,
  locatedError,
  GraphQLError,
  printError,
  FieldNode,
  BREAK,
} from "graphql";

function validateMatch({ node }: { node: FieldNode; variables: any }): any {
  function enter(_node, key, parent, path) {
    const n = _node as FieldNode;

    if (!n.selectionSet) {
      const error = locatedError("MATCH requires a selection", n, path);

      throw error;
    }

    return BREAK;
  }

  visit(node, {
    enter,
  });
}

/**
    Validates DGQL query.
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
  let hasSeenTopLevelReturn = false;

  function enter(node, key, parent, path) {
    if (node.kind === "Document") {
      return;
    }

    if (node === null) {
      return null;
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

        if (selection.name.value === "RETURN") {
          if (hasSeenTopLevelReturn) {
            const error = locatedError(
              `Found a second RETURN when only one allowed`,
              selection,
              path
            );

            throw error;
          }

          hasSeenTopLevelReturn = true;
        }

        if (selection.name.value === "MATCH") {
          validateMatch({
            node: selection,
            variables,
          });
        }
      });
    }

    return node;
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
