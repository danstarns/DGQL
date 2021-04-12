import { ArgumentNode, FieldNode, valueFromASTUntyped } from "graphql";
import createWhereAndParams from "./create-where-and-params";

function createDeleteAndParams({
  deleteField,
  variables,
  chainStr,
  withVars,
  escapeQuotes,
}: {
  deleteField: FieldNode;
  variables: Record<string, unknown>;
  chainStr: string;
  withVars: string[];
  escapeQuotes?: boolean;
}): [string, any] {
  let cyphers: string[] = [];
  let params: Record<string, unknown> = {};

  (deleteField.selectionSet?.selections as FieldNode[]).forEach((field, i) => {
    const varName = `${chainStr}_${field.name.value}${i}`;

    const labelArg = (field?.arguments || [])?.find(
      (x) => x.name.value === "label"
    ) as ArgumentNode;

    const label = labelArg
      ? valueFromASTUntyped(labelArg.value, variables)
      : (undefined as string | undefined);

    const detachDirective = (field.directives || []).find(
      (x) => x.name.value === "detach"
    );

    const selections = (field.selectionSet?.selections || []) as FieldNode[];

    const whereSelection = selections.find((x) => x.name.value === "WHERE");

    cyphers.push(`CALL {`);

    if (withVars.length) {
      cyphers.push(`WITH ${withVars.join(", ")}`);
    }

    cyphers.push(`MATCH (${varName}${label ? `:${label}` : ""})`);

    if (whereSelection) {
      const wAP = createWhereAndParams({
        varName,
        variables,
        whereField: whereSelection,
        chainStr,
      });
      cyphers.push(wAP[0]);
      params = { ...params, ...wAP[1] };
    }
    cyphers.push(`${detachDirective ? "DETACH" : ""} DELETE ${varName}`);

    cyphers.push(`RETURN COUNT(*)`);

    cyphers.push(`}`); // Close CALL
  });
  return [cyphers.join("\n"), params];
}

export default createDeleteAndParams;
