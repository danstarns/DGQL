import { ArgumentNode, FieldNode, valueFromASTUntyped } from "graphql";
import createWhereAndParams from "./create-where-and-params";
import { getEdgeMeta } from "../utils";

function createDisconnectAndParams({
  selection,
  variables,
  parentVar,
  withVars,
  chainStr,
}: {
  selection: FieldNode;
  variables: any;
  parentVar: string;
  withVars: string[];
  chainStr: string;
}): [string, any] {
  let strs: string[] = [];
  let params = {};

  const quote = `\\"`;
  const selections = (selection.selectionSet?.selections || []) as FieldNode[];
  const { type, direction } = getEdgeMeta({ selection, variables });
  const nodeSelect = selections.find((x) => x.name.value === "NODE");
  const propertiesSelect = selections.find(
    (x) => x.name.value === "PROPERTIES"
  );

  const toNodeVar = `${chainStr}_NODE`;
  const relVarName = `${chainStr}_PROPERTIES`;

  const nodeWhere = ((nodeSelect?.selectionSet?.selections ||
    []) as FieldNode[]).find((x) => x.name.value === "WHERE");

  const propertiesWhere = ((propertiesSelect?.selectionSet?.selections ||
    []) as FieldNode[]).find((x) => x.name.value === "WHERE");

  const labelArg = (nodeSelect?.arguments || [])?.find(
    (x) => x.name.value === "label"
  ) as ArgumentNode;

  const label = labelArg
    ? valueFromASTUntyped(labelArg.value, variables)
    : (undefined as string | undefined);

  const inStr = direction === "IN" ? "<-" : "-";
  const outStr = direction === "OUT" ? "->" : "-";
  const relTypeStr = type ? `[${relVarName}:${type}]` : `[${relVarName}]`;

  strs.push(`CALL {`);
  strs.push(`WITH ${withVars.join(", ")}`);
  strs.push(
    `OPTIONAL MATCH (${parentVar})${inStr}${relTypeStr}${outStr}(${toNodeVar}${
      label ? `:${label}` : ""
    })`
  );

  let whereStrs: string[] = [];
  if (nodeWhere) {
    const whereAndParams = createWhereAndParams({
      varName: toNodeVar,
      whereField: nodeWhere,
      chainStr: `${toNodeVar}_where`,
      variables,
      noWhere: true,
    });
    whereStrs.push(whereAndParams[0]);
    params = { ...params, ...whereAndParams[1] };
  }

  if (propertiesWhere) {
    const whereAndParams = createWhereAndParams({
      varName: relVarName,
      whereField: propertiesWhere,
      chainStr: `${relVarName}_where`,
      variables,
      noWhere: true,
    });
    whereStrs.push(whereAndParams[0]);
    params = { ...params, ...whereAndParams[1] };
  }

  if (whereStrs.length) {
    strs.push(`WHERE ${whereStrs.join(" AND ")}`);
  }

  strs.push(`CALL apoc.do.when(${toNodeVar} IS NOT NULL, ${quote}`);

  strs.push(`DELETE ${relVarName}`);

  if (nodeSelect?.selectionSet?.selections.length) {
    const nodeSelections = nodeSelect.selectionSet.selections as FieldNode[];

    nodeSelections.forEach((select, i) => {
      if (select.name.value !== "DISCONNECT") {
        return;
      }

      const innerChainStr = `${toNodeVar}_disconnect${i}`;
      const dAP = createDisconnectAndParams({
        selection: select,
        variables,
        parentVar: toNodeVar,
        withVars: [...withVars, toNodeVar],
        chainStr: innerChainStr,
      });
      if (dAP[0]) {
        strs.push(`WITH ${[...withVars, toNodeVar].join(", ")}`);
        strs.push(dAP[0]);
        params = { ...params, ...dAP[1] };
      }
    });
  }

  strs.push(`RETURN COUNT(*)`);
  strs.push(quote);
  strs.push(`, ${quote}${quote}`);
  strs.push(
    `, { params: $params, ${toNodeVar}: ${toNodeVar}, ${relVarName}: ${relVarName} }`
  );
  strs.push(`) YIELD value AS _`);

  strs.push(`RETURN COUNT(*)`);
  strs.push(`}`); // close CALL

  return [strs.join("\n"), params];
}

export default createDisconnectAndParams;
