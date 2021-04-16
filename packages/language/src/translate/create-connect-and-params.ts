import { ArgumentNode, FieldNode, valueFromASTUntyped } from "graphql";
import createWhereAndParams from "./create-where-and-params";
import createSetAndParams from "./create-set-and-params";
import { getEdgeMeta } from "../utils";
import createCreateAndParams from "./create-create-and-params";

function createConnectAndParams({
  selections,
  chainStr,
  parentVar,
  direction,
  type,
  variables,
  withVars,
  escapeQuotes,
}: {
  selections: FieldNode[];
  chainStr: string;
  parentVar: string;
  type?: string;
  direction?: string;
  variables: any;
  withVars: string[];
  escapeQuotes?: boolean;
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

  strs.push("CALL {");
  strs.push(`WITH ${withVars.join(", ")}`);
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

  const quote = escapeQuotes ? `\\"` : `"`;

  strs.push(
    [
      `CALL apoc.do.when(${_varName} IS NOT NULL, ${quote}`,
      `MERGE (${parentVar})${inStr}${relTypeStr}${outStr}(${_varName})`,
    ].join("\n")
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

  if (nodeSelection.selectionSet?.selections.length) {
    (nodeSelection.selectionSet?.selections as FieldNode[]).forEach(
      (selection, i) => {
        const selections = (selection.selectionSet?.selections ||
          []) as FieldNode[];

        if (selection.name.value === "CONNECT") {
          const { type, direction } = getEdgeMeta({ selection, variables });

          strs.push(`WITH ${withVars.join(", ")}, ${_varName}`);
          const cCAP = createConnectAndParams({
            chainStr: `${_varName}_connect${i}`,
            parentVar: _varName,
            selections,
            variables,
            type,
            direction,
            withVars: [...withVars, _varName],
            escapeQuotes: true,
          });
          if (cCAP[0]) {
            strs.push(cCAP[0]);
            params = { ...params, ...cCAP[1] };
          }
          return;
        }

        if (selection.name.value === "CREATE") {
          const { type, direction } = getEdgeMeta({ selection, variables });

          const nodeSelectionIndex = selections.findIndex(
            (x) => x.kind === "Field" && x.name.value === "NODE"
          );
          const propertiesSelectionIndex = selections.findIndex(
            (x) => x.kind === "Field" && x.name.value === "PROPERTIES"
          );

          const nodeSelection = selections[nodeSelectionIndex] as FieldNode;
          const propertiesSelection = selections[
            propertiesSelectionIndex
          ] as FieldNode;

          if (!nodeSelection) {
            throw new Error("CONNECT NODE CREATE @edge NODE required");
          }

          const innerChainStr = `${_varName}_create${i}`;
          const inStr = direction === "IN" ? "<-" : "-";
          const outStr = direction === "OUT" ? "->" : "-";
          const propertiesName = propertiesSelection
            ? `${innerChainStr}_PROPERTIES`
            : "";
          const relTypeStr = type
            ? `[${propertiesName ? propertiesName : ""}:${type}]`
            : `[]`;

          const cAP = createCreateAndParams({
            createField: {
              ...selection,
              selectionSet: {
                kind: "SelectionSet",
                selections: [nodeSelection],
              },
            },
            chainStr: innerChainStr,
            variables,
            withVars: [...withVars, _varName],
            escapeQuotes: true,
          });
          params = { ...params, ...cAP[1] };

          if (!cAP[0]) {
            return;
          }

          strs.push(`WITH ${withVars.join(", ")}, ${_varName}`);
          strs.push(cAP[0]);
          strs.push(
            `MERGE (${_varName})${inStr}${relTypeStr}${outStr}(${`${innerChainStr}_NODE`})`
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
            strs.push(sAP[0]);
            params = { ...params, ...sAP[1] };
          }
        }
      }
    );
  }

  strs.push(quote);
  strs.push(`, ${quote}${quote}`);
  strs.push(
    `, { params: $params, ${_varName}: ${_varName}, ${parentVar}: ${parentVar} }`
  );
  strs.push(") YIELD value as _");
  strs.push("RETURN COUNT(*)");
  strs.push("}"); // close CALL

  return [strs.join("\n"), params];
}

export default createConnectAndParams;
