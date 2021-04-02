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
    const varName = field.name.value;
    const nodeDirective = field.directives?.find(
      (x) => x.name.value === "node"
    ) as DirectiveNode;

    if (!nodeDirective) {
      throw new Error("@node required");
    }

    cyphers.push(`CALL {`);

    const labelArg = (nodeDirective?.arguments || [])?.find(
      (x) => x.name.value === "label"
    ) as ArgumentNode;

    const label = labelArg
      ? valueFromASTUntyped(labelArg.value, variables)
      : (undefined as string | undefined);

    cyphers.push(`CREATE (${varName}${label ? `:${label}` : ""})`);

    cyphers.push(`RETURN ${varName}`);
    cyphers.push(`}`); // close CALL
  });

  return [cyphers.join("\n"), params];
}

export default createCreateAndParams;
