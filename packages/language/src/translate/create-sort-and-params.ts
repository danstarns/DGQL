import { ArgumentNode, FieldNode, valueFromASTUntyped } from "graphql";

function createSortAndParams({
  varName,
  sortField,
  variables,
  nestedVersion,
}: {
  varName: string;
  sortField: FieldNode;
  variables: Record<string, unknown>;
  nestedVersion?: boolean;
}): [string, Record<string, unknown>] {
  const params = {};
  const selections = sortField.selectionSet?.selections as FieldNode[];

  if (nestedVersion) {
    const sorts = selections.map((field) => {
      const direction: "ASC" | "DESC" = valueFromASTUntyped(
        (((field.arguments || []) as ArgumentNode[]).find(
          (arg) => arg.name.value === "direction"
        ) as ArgumentNode).value,
        variables
      );

      if (direction === "DESC") {
        return `'${field.name.value}'`;
      }

      return `'^${field.name.value}'`;
    });

    return [`[${sorts.join(", ")}]`, {}];
  }

  const sorts = selections.map((field) => {
    let direction: "ASC" | "DESC" = valueFromASTUntyped(
      (((field.arguments || []) as ArgumentNode[]).find(
        (arg) => arg.name.value === "direction"
      ) as ArgumentNode).value,
      variables
    );

    return `${varName}.${field.name.value} ${direction}`;
  });

  if (!sorts.length) {
    return ["", params];
  }

  return [`WITH ${varName}\nORDER BY ${sorts.join(", ")}`, params];
}

export default createSortAndParams;
