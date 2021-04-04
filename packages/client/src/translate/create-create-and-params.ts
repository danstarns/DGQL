import {
  ArgumentNode,
  DirectiveNode,
  FieldNode,
  valueFromASTUntyped,
} from "graphql";

function createCreateAndParams({
  createField,
  variables,
  chainStr,
}: {
  createField: FieldNode;
  variables: Record<string, unknown>;
  chainStr?: string;
}): [string, any] {
  let cyphers: string[] = [];
  let params: Record<string, unknown> = {};

  (createField.selectionSet?.selections as FieldNode[]).forEach((field) => {
    let node: FieldNode | DirectiveNode | undefined;

    node = field.directives?.find(
      (x) => x.name.value === "node"
    ) as DirectiveNode;
    if (!node) {
      node = field;
    }

    let varName: string = "";
    if (chainStr) {
      varName = `${chainStr}_${field.name.value}`;
    } else {
      varName = field.name.value;
    }

    const labelArg = (node?.arguments || [])?.find(
      (x) => x.name.value === "label"
    ) as ArgumentNode;

    const label = labelArg
      ? valueFromASTUntyped(labelArg.value, variables)
      : (undefined as string | undefined);

    cyphers.push(`CALL {`);
    cyphers.push(`CREATE (${varName}${label ? `:${label}` : ""})`);

    const selections = (field.selectionSet?.selections || []) as FieldNode[];
    selections.forEach((selection, i) => {
      if (selection.name.value === "SET") {
        const setSelections = selection.selectionSet?.selections as FieldNode[];

        setSelections?.forEach((selection) => {
          const valueArg = (selection?.arguments || [])?.find(
            (x) => x.name.value === "value"
          ) as ArgumentNode;

          if (!valueArg) {
            throw new Error("value arg required for SET.property");
          }

          const paramName = `${varName}_set_${selection.name.value}`;
          cyphers.push(
            `SET ${varName}.${selection.name.value} = $params.${paramName}`
          );
          params[paramName] = valueFromASTUntyped(valueArg.value, variables);
        });

        return;
      }

      if (selection.name.value === "CREATE") {
        const edgeDirective = selection.directives?.find(
          (x) => x.name.value === "edge"
        ) as DirectiveNode;

        if (!edgeDirective) {
          throw new Error("CREATE @edge required");
        }

        const edgeArgs = edgeDirective?.arguments || [];

        const typeArg = edgeArgs.find(
          (x) => x.name.value === "type"
        ) as ArgumentNode;

        const directionArg = edgeArgs.find(
          (x) => x.name.value === "direction"
        ) as ArgumentNode;

        const type = typeArg
          ? valueFromASTUntyped(typeArg.value, variables)
          : (undefined as string | undefined);

        const direction = directionArg
          ? valueFromASTUntyped(directionArg.value, variables)
          : (undefined as string | undefined);

        const nodeSelection = selection.selectionSet?.selections.find(
          (x) => x.kind === "Field" && x.name.value === "NODE"
        ) as FieldNode;

        if (!nodeSelection) {
          throw new Error("CREATE @edge NODE required");
        }

        const innerChainStr = `${varName}_create${i}`;

        const cCAP = createCreateAndParams({
          createField: selection,
          variables,
          chainStr: innerChainStr,
        });

        const inStr = direction === "IN" ? "<-" : "-";
        const outStr = direction === "OUT" ? "->" : "-";
        const relTypeStr = type ? `[:${type}]` : `[]`;

        cyphers.push(`WITH ${varName}`);
        cyphers.push(cCAP[0]);
        cyphers.push(
          `MERGE (${varName})${inStr}${relTypeStr}${outStr}(${`${innerChainStr}_${nodeSelection.name.value}`})`
        );
        params = { ...params, ...cCAP[1] };

        return;
      }
    });

    cyphers.push(`RETURN ${varName}`);
    cyphers.push(`}`); // close CALL
  });

  return [cyphers.join("\n"), params];
}

export default createCreateAndParams;
