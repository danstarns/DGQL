import {
  visit,
  locatedError,
  BREAK,
  SelectionSetNode,
  DirectiveNode,
} from "graphql";

function validateMatchSelectionSet({
  selectionSetNode,
}: {
  selectionSetNode: SelectionSetNode;
}) {
  function enter(x, key, parent, path) {
    if (x.kind !== "Field") {
      const error = locatedError("Fields are only supported here", x, path);

      throw error;
    }

    const directives = (x.directives || []) as DirectiveNode[];
    const cypherDirective = directives.find((x) => x.name.value === "cypher");

    if (cypherDirective) {
      const otherDirectives = directives.filter(
        (x) => x.name.value !== "cypher"
      );

      if (otherDirectives.length) {
        const error = locatedError(`@cypher to be used alone`, x, path);

        throw error;
      }

      // VALIDATE PROJECTION
      return BREAK;
    }

    const allowedDirectives = ["node", "paginate", "where", "optional"];
    const forbiddenDirectives = directives.filter(
      (x) => !allowedDirectives.includes(x.name.value)
    );

    if (forbiddenDirectives.length) {
      const error = locatedError(
        `directives ${forbiddenDirectives
          .map((x) => x.name.value)
          .join(", ")} not allowed here`,
        x,
        path
      );

      throw error;
    }

    const nodeDirectives = directives.filter((x) => x.name.value === "node");
    if (nodeDirectives.length > 1) {
      const error = locatedError(`only one @node directive allowed`, x, path);

      throw error;
    }

    const [node] = nodeDirectives;
    if (!node) {
      const error = locatedError(`@node or @cypher directive missing`, x, path);

      throw error;
    }

    return BREAK;
  }

  selectionSetNode.selections.forEach((selection) => {
    visit(selection, {
      enter,
    });
  });
}

export default validateMatchSelectionSet;
