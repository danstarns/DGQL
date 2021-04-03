import {
  ArgumentNode,
  DirectiveNode,
  FieldNode,
  valueFromASTUntyped,
} from "graphql";

function createCreateAndParams({
  matchField,
  variables,
}: {
  matchField: FieldNode;
  variables: Record<string, unknown>;
}): [string, any] {
  let cyphers: string[] = [];
  let params: Record<string, unknown> = {};

  (matchField.selectionSet?.selections as FieldNode[]).forEach((field) => {
    const nodeDirective = field.directives?.find(
      (x) => x.name.value === "node"
    ) as DirectiveNode;
    if (!nodeDirective) {
      throw new Error("@node required");
    }

    const varName = field.name.value;
    const selections = (field.selectionSet?.selections || []) as FieldNode[];
    const setSelection = selections.find((x) => x.name.value === "SET") as
      | FieldNode
      | undefined;

    const labelArg = (nodeDirective?.arguments || [])?.find(
      (x) => x.name.value === "label"
    ) as ArgumentNode;

    const label = labelArg
      ? valueFromASTUntyped(labelArg.value, variables)
      : (undefined as string | undefined);

    cyphers.push(`CALL {`);
    cyphers.push(`CREATE (${varName}${label ? `:${label}` : ""})`);

    if (setSelection) {
      const setSelections = setSelection.selectionSet
        ?.selections as FieldNode[];

      setSelections?.forEach((selection) => {
        const valueArg = (selection?.arguments || [])?.find(
          (x) => x.name.value === "value"
        ) as ArgumentNode;

        if (!valueArg) {
          throw new Error("value arg required for SET.property");
        }

        const paramName = `create_${varName}_set_${selection.name.value}`;
        cyphers.push(
          `SET ${varName}.${selection.name.value} = $params.${paramName}`
        );
        params[paramName] = valueFromASTUntyped(valueArg.value, variables);
      });
    }

    cyphers.push(`RETURN ${varName}`);
    cyphers.push(`}`); // close CALL
  });

  return [cyphers.join("\n"), params];
}

export default createCreateAndParams;
