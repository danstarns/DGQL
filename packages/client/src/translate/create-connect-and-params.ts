import { ArgumentNode, FieldNode, valueFromASTUntyped } from "graphql";
import createWhereAndParams from "./create-where-and-params";
import createSetAndParams from "./create-set-and-params";
import { getEdgeMeta } from "../utils";

function createConnectAndParams({
  selections,
  chainStr,
  parentVar,
  direction,
  type,
  variables,
  withVars,
}: {
  selections: FieldNode[];
  chainStr: string;
  parentVar: string;
  type?: string;
  direction?: string;
  variables: any;
  withVars: string[];
}): [string, any] {
  let strs: string[] = [];
  let params = {};

  const nodeSelection = selections.find(
    (x) => x.kind === "Field" && x.name.value === "NODE"
  ) as FieldNode;

  const labelArg = (nodeSelection?.arguments || [])?.find(
    (x) => x.name.value === "label"
  ) as ArgumentNode;

  const label = labelArg
    ? valueFromASTUntyped(labelArg.value, variables)
    : (undefined as string | undefined);

  const nodeWhere = ((nodeSelection.selectionSet?.selections ||
    []) as FieldNode[]).find((x) => x.name.value === "WHERE");

  const propertiesSelection = selections.find(
    (x) => x.kind === "Field" && x.name.value === "PROPERTIES"
  ) as FieldNode;

  const propertiesSet = ((propertiesSelection?.selectionSet?.selections ||
    []) as FieldNode[]).find((x) => x.name.value === "SET");

  if (!nodeSelection) {
    throw new Error("CONNECT @edge NODE required");
  }

  const inStr = direction === "IN" ? "<-" : "-";
  const outStr = direction === "OUT" ? "->" : "-";
  const propertiesName = propertiesSelection ? `${chainStr}_PROPERTIES` : "";
  const relTypeStr = type
    ? `[${propertiesName ? propertiesName : ""}:${type}]`
    : `[]`;

  const _varName = `${chainStr}_NODE`;

  strs.push(`OPTIONAL MATCH (${_varName}${label ? `:${label}` : ""})`);

  if (nodeWhere) {
    const wAP = createWhereAndParams({
      varName: _varName,
      variables,
      whereField: nodeWhere,
      chainStr: `${_varName}_where`,
    });
    if (wAP[0]) {
      strs.push(wAP[0]);
      params = { ...params, ...wAP[1] };
    }
  }

  strs.push(
    [
      `FOREACH(_ IN CASE ${_varName} WHEN NULL THEN [] ELSE [1] END |`,
      `MERGE (${parentVar})${inStr}${relTypeStr}${outStr}(${_varName})`,
    ].join(" ")
  );

  if (propertiesSet) {
    const sAP = createSetAndParams({
      varName: propertiesName,
      setSelections: (propertiesSet?.selectionSet?.selections ||
        []) as FieldNode[],
      variables,
    });
    strs.push(sAP[0]);
    params = { ...params, ...sAP[1] };
  }

  strs.push(")"); // close foreach

  if (nodeSelection.selectionSet?.selections.length) {
    (nodeSelection.selectionSet?.selections as FieldNode[]).forEach(
      (selection, i) => {
        if (selection.name.value === "CONNECT") {
          const { type, direction } = getEdgeMeta({ selection, variables });

          strs.push(`WITH ${withVars.join(", ")}, ${_varName}`);
          const cCAP = createConnectAndParams({
            chainStr: `${_varName}_connect${i}`,
            parentVar: _varName,
            selections: selection.selectionSet?.selections as FieldNode[],
            variables,
            type,
            direction,
            withVars: [...withVars, _varName],
          });
          if (cCAP[0]) {
            strs.push(cCAP[0]);
            params = { ...params, ...cCAP[1] };
          }
          return;
        }

        if (selection.name.value === "CREATE") {
          return;
        }
      }
    );
  }

  return [strs.join("\n"), params];
}

export default createConnectAndParams;
