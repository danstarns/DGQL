import { visit, locatedError, FieldNode, BREAK } from "graphql";
import validateMatchSelectionSet from "./validate-match-selection-set";

function validateMatch({ node }: { node: FieldNode; variables: any }): void {
  function enter(_node, key, parent, path) {
    const n = _node as FieldNode;

    if (!n.selectionSet || !n.selectionSet?.selections?.length) {
      const error = locatedError("MATCH requires a selection", n, path);

      throw error;
    }

    ["directives", "arguments"].forEach((type) => {
      if (n[type]?.length) {
        const error = locatedError(`${type} not allowed on MATCH`, n, path);

        throw error;
      }
    });

    validateMatchSelectionSet({ selectionSetNode: n.selectionSet });

    return BREAK;
  }

  visit(node, {
    enter,
  });
}

export default validateMatch;
