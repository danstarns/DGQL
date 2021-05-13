import { BREAK, FieldNode, locatedError, visit } from "graphql";

function validateWhereSelection({
  whereSelection,
  path,
  variables,
  type,
}: {
  whereSelection: FieldNode;
  path: any;
  variables: any;
  type: "node" | "relationship";
}) {
  ["directives", "arguments"].forEach((name) => {
    if (whereSelection[name]?.length) {
      const error = locatedError(
        `WHERE requires no ${name}`,
        whereSelection,
        path
      );

      throw error;
    }
  });

  if (!whereSelection.selectionSet?.selections.length) {
    const error = locatedError(
      `WHERE requires requires a selection`,
      whereSelection,
      path
    );

    throw error;
  }

  function enter(field, key, parent, path) {
    const f = field as FieldNode;

    const directives = f.directives;
    const args = f.arguments;

    if (f.name.value === "EDGE") {
      if (type === "relationship") {
        const error = locatedError(
          `Cannot edge WHERE from relationship properties`,
          f,
          path
        );

        throw error;
      }

      // TODO validate whereEdgeSelection - same file?

      return BREAK;
    }

    if (directives?.length) {
      const error = locatedError(`WHERE field requires no directives`, f, path);

      throw error;
    }

    if (["AND", "OR", "XOR"].includes(f.name.value)) {
      // TODO validate and or

      return BREAK;
    }

    if (!args?.length) {
      const error = locatedError(
        `WHERE field requires operator argument`,
        f,
        path
      );

      throw error;
    }

    args.forEach((arg) => {
      const validOperators = [
        "equal",
        "in",
        "not",
        "exists",
        "gt",
        "gte",
        "lt",
        "lte",
        "starts_with",
        "ends_with",
        "contains",
        "regex",
      ];

      if (!validOperators.includes(arg.name.value)) {
        const error = locatedError(
          `WHERE field invalid operator '${
            arg.name.value
          }' try one of: ${validOperators.join(", ")}`,
          arg,
          path
        );

        throw error;
      }
    });

    return BREAK;
  }

  whereSelection?.selectionSet.selections.forEach((selection) => {
    visit(selection, {
      enter,
    });
  });
}

export default validateWhereSelection;
