import {
  ArgumentNode,
  DirectiveNode,
  FieldNode,
  valueFromASTUntyped,
} from "graphql";
import createConnectAndParams from "./create-connect-and-params";
import createProjectionAndParams from "./create-projection-and-params";
import createSetAndParams from "./create-set-and-params";

function getEdgeMeta({
  selection,
  variables,
}: {
  selection: FieldNode;
  variables: any;
}): { direction?: string; type?: string } {
  const edgeDirective = selection.directives?.find(
    (x) => x.name.value === "edge"
  ) as DirectiveNode;

  if (!edgeDirective) {
    throw new Error("CREATE @edge required");
  }

  const edgeArgs = edgeDirective?.arguments || [];

  const typeArg = edgeArgs.find((x) => x.name.value === "type") as ArgumentNode;

  const directionArg = edgeArgs.find(
    (x) => x.name.value === "direction"
  ) as ArgumentNode;

  const type = typeArg
    ? valueFromASTUntyped(typeArg.value, variables)
    : (undefined as string | undefined);

  const direction = directionArg
    ? valueFromASTUntyped(directionArg.value, variables)
    : (undefined as string | undefined);

  return {
    type,
    direction,
  };
}

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
        const sAP = createSetAndParams({ varName, setSelections, variables });
        cyphers.push(sAP[0]);
        params = { ...params, ...sAP[1] };
        return;
      }

      if (selection.name.value === "CREATE") {
        const { type, direction } = getEdgeMeta({ selection, variables });

        const selections = (selection.selectionSet?.selections ||
          []) as FieldNode[];

        const nodeSelection = selections.find(
          (x) => x.kind === "Field" && x.name.value === "NODE"
        ) as FieldNode;

        const propertiesSelection = selections.find(
          (x) => x.kind === "Field" && x.name.value === "PROPERTIES"
        ) as FieldNode;

        if (!nodeSelection) {
          throw new Error("CREATE @edge NODE required");
        }

        const innerChainStr = `${varName}_create${i}`;

        const cCAP = createCreateAndParams({
          createField: {
            ...selection,
            selectionSet: { kind: "SelectionSet", selections: [nodeSelection] },
          },
          variables,
          chainStr: innerChainStr,
        });
        params = { ...params, ...cCAP[1] };

        const inStr = direction === "IN" ? "<-" : "-";
        const outStr = direction === "OUT" ? "->" : "-";
        const propertiesName = propertiesSelection
          ? `${innerChainStr}_PROPERTIES`
          : "";
        const relTypeStr = type
          ? `[${propertiesName ? propertiesName : ""}:${type}]`
          : `[]`;

        cyphers.push(`WITH ${varName}`);
        cyphers.push(cCAP[0]);
        cyphers.push(
          `MERGE (${varName})${inStr}${relTypeStr}${outStr}(${`${innerChainStr}_${nodeSelection.name.value}`})`
        );

        if (propertiesSelection) {
          const setSelections = (propertiesSelection.selectionSet?.selections.find(
            (x) => x.kind === "Field" && x.name.value === "SET"
          ) as FieldNode).selectionSet?.selections as FieldNode[];

          const sAP = createSetAndParams({
            varName: propertiesName,
            setSelections,
            variables,
          });
          cyphers.push(sAP[0]);
          params = { ...params, ...sAP[1] };
        }

        return;
      }

      if (selection.name.value === "CONNECT") {
        const { type, direction } = getEdgeMeta({ selection, variables });
        const selections = (selection.selectionSet?.selections ||
          []) as FieldNode[];
        const innerChainStr = `${varName}_connect${i}`;
        const cCAP = createConnectAndParams({
          chainStr: innerChainStr,
          type,
          direction,
          selections,
          variables,
          parentVar: varName,
        });

        if (cCAP[0]) {
          cyphers.push(`WITH ${varName}`);
          cyphers.push(cCAP[0]);
          params = { ...params, ...cCAP[1] };
        }
      }
    });

    const projectField = selections.find((x) => x.name.value === "PROJECT");
    if (projectField) {
      const pAP = createProjectionAndParams({
        varName,
        projectField,
        variables,
      });
      params = { ...params, ...pAP[1] };
      cyphers.push(`RETURN ${varName} ${pAP[0]} AS ${varName}`);
    } else {
      cyphers.push(`RETURN ${varName}`);
    }

    cyphers.push(`}`); // close CALL
  });

  return [cyphers.join("\n"), params];
}

export default createCreateAndParams;
