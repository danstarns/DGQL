import { locatedError, FieldNode } from "graphql";
import validateCypherDirective from "./validate-cypher-directive";
import validateEdgeSelection from "./validate-edge-selection";
import validateProject from "./validate-project";
import validateWhereSelection from "./validate-where-selection";

function validatePropertiesSelection({
  propertiesSelection,
  variables,
  path,
}: {
  propertiesSelection: FieldNode;
  variables: any;
  path: any;
}) {
  ["arguments", "directives"].forEach((t) => {
    if (propertiesSelection[t]?.length) {
      const error = locatedError(
        `${t} not valid on PROPERTIES`,
        propertiesSelection,
        path
      );
      throw error;
    }
  });

  if (!propertiesSelection.selectionSet?.selections.length) {
    const error = locatedError(
      `PROPERTIES requires a selection`,
      propertiesSelection,
      path
    );

    throw error;
  }

  (propertiesSelection.selectionSet?.selections as FieldNode[]).forEach(
    (selection) => {
      const validSelections = ["WHERE", "PROJECT"];

      if (!validSelections.includes(selection.name.value)) {
        const error = locatedError(
          `Invalid PROPERTIES selection, try one of PROJECT or WHERE`,
          propertiesSelection,
          path
        );

        throw error;
      }

      if (selection.name.value === "PROJECT") {
        validateProject({
          projectField: selection,
          path,
          type: "relationship",
          variables,
        });

        return;
      }

      if (selection.name.value === "WHERE") {
        validateWhereSelection({
          whereSelection: selection,
          path,
          type: "relationship",
          variables,
        });

        return;
      }
    }
  );
}

export default validatePropertiesSelection;
