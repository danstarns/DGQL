import { BREAK, FieldNode, locatedError, validate, visit } from "graphql";
import validateProject from "./validate-project";

const validNames = ["WHERE", "SORT", "PROJECT"];

function validateNodeSelection({
  node,
  variables,
  path,
}: {
  node: FieldNode;
  variables: any;
  path: any;
}) {
  if (!node.selectionSet?.selections?.length) {
    return;
  }

  function enter(field, key, parent, path) {
    if (field.kind !== "Field") {
      return;
    }

    const f = field as FieldNode;

    if (!validNames.includes(f.name.value)) {
      const error = locatedError(
        "Invalid node selection try one of; PROJECT, WHERE, SORT",
        field,
        path
      );

      throw error;
    }

    // TODO Validate SORT selection
    // TODO Validate WHERE selection

    if (f.name.value === "PROJECT") {
      validateProject({
        projectField: f,
        variables,
        path,
        type: "node",
      });
    }

    return BREAK;
  }

  validNames.forEach((name) => {
    const selects = (node.selectionSet?.selections || []).filter(
      (x) => x?.kind === "Field" && x.name.value === name
    );

    if (selects.length > 1) {
      const error = locatedError(
        `Only one ${name} allowed`,
        selects[1] || selects[0],
        path
      );

      throw error;
    }
  });

  node?.selectionSet.selections.forEach((selection) => {
    visit(selection, {
      enter,
    });
  });
}

export default validateNodeSelection;
