import { locatedError, FieldNode } from "graphql";
import validateCypherDirective from "./validate-cypher-directive";
import validateEdgeSelection from "./validate-edge-selection";

function validateProject({
  projectField,
  variables,
  path,
  type,
}: {
  projectField: FieldNode;
  variables: any;
  path: any;
  type: "node" | "relationship";
}) {
  if (!projectField.selectionSet?.selections.length) {
    const error = locatedError(
      `PROJECT requires a selection`,
      projectField,
      path
    );

    throw error;
  }

  (projectField.selectionSet.selections as FieldNode[]).forEach((selection) => {
    if (selection.arguments?.length) {
      const error = locatedError(
        `Field requires no arguments`,
        selection,
        path
      );

      throw error;
    }

    const edgeDirective = selection.directives?.find(
      (x) => x.name.value === "edge"
    );

    if (edgeDirective) {
      if (type === "relationship") {
        const error = locatedError(
          `Cannot edge on relationship properties`,
          selection,
          path
        );

        throw error;
      }

      validateEdgeSelection({ edgeSelection: selection, variables, path });

      return;
    }

    const cypherDirective = selection.directives?.find(
      (x) => x.name.value === "cypher"
    );
    if (cypherDirective) {
      validateCypherDirective({ directive: cypherDirective, variables, path });

      return;
    }

    if (selection.directives?.length) {
      const error = locatedError(
        `Field requires no directives`,
        selection,
        path
      );

      throw error;
    }
  });
}

export default validateProject;
