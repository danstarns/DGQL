import { FieldNode, locatedError } from "graphql";
import validateNodeDirective from "./validate-node-directive";
import validateNodeSelection from "./validate-node-selection";
import validateProject from "./validate-project";
import validatePropertiesSelection from "./validate-properties-selection";

function validateEdgeSelection({
  edgeSelection,
  variables,
  path,
}: {
  edgeSelection: FieldNode;
  variables: any;
  path: any;
}) {
  if (!edgeSelection.selectionSet?.selections.length) {
    const error = locatedError(
      `Edge must have a selection`,
      edgeSelection,
      path
    );

    throw error;
  }

  // TODO Validate edge directive
  const edgeDirective = edgeSelection.directives?.find(
    (x) => x.name.value === "edge"
  );
  const nodeDirective = edgeSelection.directives?.find(
    (x) => x.name.value === "node"
  );
  // TODO validate paginate directive
  const paginateDirective = edgeSelection.directives?.find(
    (x) => x.name.value === "paginate"
  );
  // TODO validate where directive
  const whereDirective = edgeSelection.directives?.find(
    (x) => x.name.value === "where"
  );

  const otherDirectives = edgeSelection.directives?.filter(
    (x) => !["edge", "node", "paginate", "where"].includes(x.name.value)
  );
  if (otherDirectives?.length) {
    const error = locatedError(
      `Invalid directive(s) on edge ${otherDirectives
        .map((x) => x.name.value)
        .join(", ")}`,
      edgeSelection,
      path
    );

    throw error;
  }

  if (edgeDirective && nodeDirective) {
    validateNodeDirective({
      directive: nodeDirective,
      path,
      variables,
    });

    validateProject({
      projectField: edgeSelection,
      variables,
      path,
      type: "node",
    });

    return;
  }

  (edgeSelection.selectionSet.selections as FieldNode[]).forEach(
    (selection) => {
      const directives = selection.directives || [];
      const args = selection?.arguments || [];

      const invalidDirectives = directives.filter(
        (x) => !["node"].includes(x.name.value)
      );
      if (invalidDirectives.length) {
        const error = locatedError(
          `Invalid directive(s) '${invalidDirectives
            .map((x) => x.name.value)
            .join(", ")}' on edge field`,
          selection,
          path
        );

        throw error;
      }

      if (args.length) {
        const error = locatedError(
          `No arguments needed on edge field`,
          selection,
          path
        );

        throw error;
      }

      if (selection.name.value === "PROPERTIES") {
        validatePropertiesSelection({
          propertiesSelection: selection,
          path,
          variables,
        });

        return;
      }

      const nodeDirective = directives?.find((x) => x.name.value === "node");
      if (!nodeDirective) {
        const error = locatedError(
          `Invalid edge selection, try using @node or PROPERTIES`,
          selection,
          path
        );

        throw error;
      }

      validateNodeDirective({
        directive: nodeDirective,
        path,
        variables,
      });

      validateNodeSelection({
        node: selection as FieldNode,
        path,
        variables,
      });
    }
  );
}

export default validateEdgeSelection;
