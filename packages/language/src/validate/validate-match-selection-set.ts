import {
  visit,
  locatedError,
  BREAK,
  SelectionSetNode,
  DirectiveNode,
} from "graphql";
import validateCypherDirective from "./validate-cypher-directive";

function validateMatchSelectionSet({
  selectionSetNode,
  variables,
}: {
  selectionSetNode: SelectionSetNode;
  variables: any;
}) {
  function enter(field, key, parent, path) {
    if (field.kind !== "Field") {
      const error = locatedError("Fields are only supported here", field, path);

      throw error;
    }

    const directives = (field.directives || []) as DirectiveNode[];
    const cypherDirective = directives.find((x) => x.name.value === "cypher");

    if (cypherDirective) {
      const otherDirectives = directives.filter(
        (x) => x.name.value !== "cypher"
      );

      if (otherDirectives.length) {
        const error = locatedError(`@cypher to be used alone`, field, path);

        throw error;
      }

      validateCypherDirective({ directive: cypherDirective, path, variables });

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
        field,
        path
      );

      throw error;
    }

    const nodeDirectives = directives.filter((x) => x.name.value === "node");
    if (nodeDirectives.length > 1) {
      const error = locatedError(
        `only one @node directive allowed`,
        field,
        path
      );

      throw error;
    }

    const [node] = nodeDirectives;
    if (!node) {
      const error = locatedError(
        `@node or @cypher directive missing`,
        field,
        path
      );

      throw error;
    }
    // validate node directive

    // Get Selections
    // Validate SORT ?
    // Validate WHERE
    // Validate PROJECTION
    // Validate NON allowed fields

    return BREAK;
  }

  selectionSetNode.selections.forEach((selection) => {
    visit(selection, {
      enter,
    });
  });
}

export default validateMatchSelectionSet;
