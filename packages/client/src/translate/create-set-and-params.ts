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
    const valueArg = (selection?.arguments || [])?.find(
      (x) => x.name.value === "value"
    ) as ArgumentNode;

    if (!valueArg) {
      throw new Error("value arg required for SET.property");
    }

    const paramName = `${varName}_set_${selection.name.value}`;
    params[paramName] = valueFromASTUntyped(valueArg.value, variables);
    strs.push(`SET ${varName}.${selection.name.value} = $params.${paramName}`);
  });

  return [strs.join("\n"), params];
}

export default createSetAndParams;
