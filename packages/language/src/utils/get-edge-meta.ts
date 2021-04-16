import {
  ArgumentNode,
  DirectiveNode,
  FieldNode,
  valueFromASTUntyped,
} from "graphql";

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
    throw new Error("@edge required");
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

export default getEdgeMeta;
