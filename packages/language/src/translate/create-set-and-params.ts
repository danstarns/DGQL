import { ArgumentNode, FieldNode, valueFromASTUntyped } from "graphql";

function createSetAndParams({
  setSelections,
  variables,
  varName,
}: {
  setSelections: FieldNode[];
  variables: any;
  varName: string;
}): [string, any] {
  let strs: string[] = [];
  let params = {};

  setSelections?.forEach((selection) => {
    const uuidDirective = selection.directives?.find(
      (x) => x.name.value === "uuid"
    );
    if (uuidDirective) {
      strs.push(`SET ${varName}.${selection.name.value} = randomUUID()`);
      return;
    }

    const dateTimeDirective = selection.directives?.find(
      (x) => x.name.value === "datetime"
    );
    const dateDirective = selection.directives?.find(
      (x) => x.name.value === "date"
    );

    const valueArg = (selection?.arguments || [])?.find(
      (x) => x.name.value === "value"
    ) as ArgumentNode;

    if (
      !valueArg &&
      ![dateTimeDirective, dateDirective].filter(Boolean).length
    ) {
      throw new Error("value arg required for SET.property");
    }

    const paramName = `${varName}_set_${selection.name.value}`;
    if (valueArg) {
      params[paramName] = valueFromASTUntyped(valueArg.value, variables);
    }

    if (dateTimeDirective) {
      strs.push(
        `SET ${varName}.${selection.name.value} = ${
          valueArg ? `datetime($params.${paramName})` : "datetime()"
        }`
      );

      return;
    }

    if (dateDirective) {
      strs.push(
        `SET ${varName}.${selection.name.value} = ${
          valueArg ? `date($params.${paramName})` : "date()"
        }`
      );

      return;
    }

    strs.push(`SET ${varName}.${selection.name.value} = $params.${paramName}`);
  });

  return [strs.join("\n"), params];
}

export default createSetAndParams;
