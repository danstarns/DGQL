import {
  visit,
  locatedError,
  BREAK,
  SelectionSetNode,
  DirectiveNode,
  FieldNode,
} from "graphql";
import validateCypherDirective from "./validate-cypher-directive";
import validateNodeDirective from "./validate-node-directive";
import validateNodeSelection from "./validate-node-selection";
import validateProject from "./validate-project";

function validateMatchSelectionSet({
  selectionSetNode,
  variables,
}: {
  selectionSetNode: SelectionSetNode;
  variables: any;
}) {
  function enter(field, key, parent, path) {
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

      if ((field as FieldNode).selectionSet?.selections.length) {
        validateProject({
          path,
          projectField: field as FieldNode,
          type: "node",
          variables,
        });
      }

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

    validateNodeDirective({
      directive: node,
      path,
      variables,
    });

    // TODO Validate Paginate Directive
    // TODO Validate Where directive

    validateNodeSelection({
      node: field,
      variables,
      path,
    });

    return BREAK;
  }

  selectionSetNode.selections.forEach((selection) => {
    visit(selection, {
      enter,
    });
  });
}

export default validateMatchSelectionSet;
