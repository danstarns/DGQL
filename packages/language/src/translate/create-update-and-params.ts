import {
  ArgumentNode,
  DirectiveNode,
  FieldNode,
  valueFromASTUntyped,
} from "graphql";
import { getEdgeMeta } from "../utils";
import createConnectAndParams from "./create-connect-and-params";
import createCreateAndParams from "./create-create-and-params";
import createDisconnectAndParams from "./create-disconnect-and-params";
import createProjectionAndParams from "./create-projection-and-params";
import createSetAndParams from "./create-set-and-params";
import createWhereAndParams from "./create-where-and-params";
import createWhereFromDirectiveAndParams from "./create-where-from-directive-and-params";

function createUpdateAndParams({
  updateField,
  variables,
  chainStr,
  withVars,
  escapeQuotes,
}: {
  updateField: FieldNode;
  variables: Record<string, unknown>;
  chainStr?: string;
  withVars: string[];
  escapeQuotes?: boolean;
}): [string, any] {
  let cyphers: string[] = [];
  let params: Record<string, unknown> = {};

  (updateField.selectionSet?.selections as FieldNode[]).forEach((field) => {
    let node: FieldNode | DirectiveNode | undefined;

    node = field.directives?.find(
      (x) => x.name.value === "node"
    ) as DirectiveNode;
    if (!node) {
      node = field;
    }

    let whereDirective;
    // @ts-ignore
    const directs = field.directives as DirectiveNode[];
    if (directs?.length) {
      whereDirective = directs.find((x) => x.name.value === "where");
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
    if (withVars.length) {
      cyphers.push(`WITH ${withVars.join(", ")}`);
    }

    cyphers.push(`OPTIONAL MATCH (${varName}${label ? `:${label}` : ""})`);

    const selections = (field.selectionSet?.selections || []) as FieldNode[];
    let whereStrs: string[] = [];

    const whereField = selections.find((x) => x.name.value === "WHERE");
    if (whereField) {
      const wAP = createWhereAndParams({
        varName,
        whereField,
        chainStr: `${varName}_where`,
        variables,
        noWhere: true,
      });
      if (wAP[0]) {
        whereStrs.push(wAP[0]);
        params = { ...params, ...wAP[1] };
      }
    }

    if (whereDirective) {
      const wAP = createWhereFromDirectiveAndParams({
        varName,
        whereDirective,
        variables,
        chainStr: `${varName}_where_directive`,
      });
      if (wAP[0]) {
        whereStrs.push(wAP[0]);
        params = { ...params, ...wAP[1] };
      }
    }

    if (whereStrs.length) {
      const joined = whereStrs.join(" AND ");

      cyphers.push(`WHERE ${joined}`);
    }

    const quote = escapeQuotes ? `\\"` : `"`;

    cyphers.push(`CALL apoc.do.when(${varName} IS NOT NULL, ${quote}`);

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
          withVars: [], // not needed here
          variables,
          chainStr: innerChainStr,
          escapeQuotes: true,
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

        cyphers.push(`WITH ${[...withVars, varName]}`);
        cyphers.push(cCAP[0]);
        cyphers.push(
          `MERGE (${varName})${inStr}${relTypeStr}${outStr}(${`${innerChainStr}_${nodeSelection.name.value}`})`
        );

        if (propertiesSelection) {
          const setSelections = (propertiesSelection.selectionSet?.selections.find(
            (x) => x.kind === "Field" && x.name.value === "SET"
          ) as FieldNode)?.selectionSet?.selections as FieldNode[];

          if (!setSelections) {
            throw new Error("CREATE @edge PROPERTIES SET required");
          }

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
          withVars: [...withVars, varName],
          escapeQuotes: true,
        });

        if (cCAP[0]) {
          cyphers.push(`WITH ${[...withVars, varName].join(", ")}`);
          cyphers.push(cCAP[0]);
          params = { ...params, ...cCAP[1] };
        }

        return;
      }

      if (selection.name.value === "DISCONNECT") {
        const innerChainStr = `${varName}_disconnect${i}`;
        const dAP = createDisconnectAndParams({
          selection,
          variables,
          parentVar: varName,
          withVars: [...withVars, varName],
          chainStr: innerChainStr,
        });
        if (dAP[0]) {
          cyphers.push(`WITH ${[...withVars, varName].join(", ")}`);
          cyphers.push(dAP[0]);
          params = { ...params, ...dAP[1] };
        }
        return;
      }

      if (selection.name.value === "UPDATE") {
        const { type, direction } = getEdgeMeta({ selection, variables });
        const selections = (selection.selectionSet?.selections ||
          []) as FieldNode[];
        const nodeSelect = selections.find((x) => x.name.value === "NODE");
        const propertiesSelect = selections.find(
          (x) => x.name.value === "PROPERTIES"
        );

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

        const propertiesVar = `${varName}_REL`;
        const toNodeVar = `${varName}_update_${i}_NODE`;
        const inStr = direction === "IN" ? "<-" : "-";
        const outStr = direction === "OUT" ? "->" : "-";
        const relTypeStr = type
          ? `[${propertiesSelect ? propertiesVar : ""}:${type}]`
          : "[]";

        cyphers.push(`CALL {`);
        cyphers.push(`WITH ${[...withVars, varName].join(", ")}`);
        cyphers.push(
          `OPTIONAL MATCH (${varName})${inStr}${relTypeStr}${outStr}(${toNodeVar}${
            label ? `:${label}` : ""
          })`
        );

        let whereStrs: string[] = [];
        if (nodeWhere) {
          const wAP = createWhereAndParams({
            varName: toNodeVar,
            whereField: nodeWhere,
            chainStr: `${toNodeVar}_where`,
            variables,
            noWhere: true,
          });
          if (wAP[0]) {
            whereStrs.push(wAP[0]);
            params = { ...params, ...wAP[1] };
          }
        }

        if (propertiesWhere) {
          const wAP = createWhereAndParams({
            varName: propertiesVar,
            whereField: propertiesWhere,
            chainStr: `${propertiesVar}_where`,
            variables,
            noWhere: true,
          });
          if (wAP[0]) {
            whereStrs.push(wAP[0]);
            params = { ...params, ...wAP[1] };
          }
        }

        if (whereStrs.length) {
          cyphers.push(`WHERE ${whereStrs.join(" AND ")}`);
        }

        const quote = `\\"`;

        cyphers.push(`CALL apoc.do.when(${toNodeVar} IS NOT NULL, ${quote}`);

        selections.forEach((selection) => {
          const selects = (selection.selectionSet?.selections ||
            []) as FieldNode[];

          if (selection.name.value === "NODE") {
            selects.forEach((select) => {
              if (select.name.value === "SET") {
                const sAP = createSetAndParams({
                  setSelections: select.selectionSet?.selections as FieldNode[],
                  varName: toNodeVar,
                  variables,
                });
                cyphers.push(sAP[0]);
                params = { ...params, ...sAP[1] };
              }
            });

            return;
          }

          if (selection.name.value === "PROPERTIES") {
            selects.forEach((select) => {
              if (select.name.value === "SET") {
                const sAP = createSetAndParams({
                  setSelections: select.selectionSet?.selections as FieldNode[],
                  varName: propertiesVar,
                  variables,
                });
                cyphers.push(sAP[0]);
                params = { ...params, ...sAP[1] };
              }
            });

            return;
          }
        });

        cyphers.push(`RETURN COUNT(*)`);
        cyphers.push(quote);
        cyphers.push(`, ${quote}${quote}`);
        cyphers.push(
          `, { params: $params, ${toNodeVar}: ${toNodeVar}${
            propertiesSelect ? `, ${propertiesVar}: ${propertiesVar}` : ""
          } }`
        );
        cyphers.push(`) YIELD value AS _`);

        cyphers.push(`RETURN COUNT(*)`);
        cyphers.push(`}`); // close CALL

        return;
      }
    });

    cyphers.push(`RETURN ${varName}`);
    cyphers.push(quote);
    cyphers.push(`, ${quote}${quote}`);
    cyphers.push(`, { params: $params, ${varName}: ${varName} }`);
    cyphers.push(`) YIELD value AS _`);

    const projectField = selections.find((x) => x.name.value === "PROJECT");
    if (projectField) {
      const pAP = createProjectionAndParams({
        varName: varName,
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

export default createUpdateAndParams;
