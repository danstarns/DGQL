import { locatedError, DirectiveNode, valueFromASTUntyped } from "graphql";

/*
    @node(label: string)
*/
function validateNodeDirective({
  directive,
  path,
  variables,
}: {
  directive: DirectiveNode;
  path: any;
  variables: any;
}) {
  if (!directive.arguments || !directive.arguments?.length) {
    return;
  }

  const labelArg = directive.arguments.find((x) => x.name.value === "label");
  if (labelArg) {
    if (
      labelArg.value.kind !== "StringValue" &&
      labelArg.value.kind !== "Variable" &&
      labelArg.value.kind !== "EnumValue"
    ) {
      const error = locatedError(
        `@node label must be of type StringValue or Argument or EnumValue`,
        directive,
        path
      );

      throw error;
    }
  }

  if (labelArg && labelArg.value.kind === "Variable") {
    const statement = (labelArg
      ? valueFromASTUntyped(labelArg.value, variables)
      : undefined) as string | undefined;

    if (typeof statement !== "string") {
      const error = locatedError(
        `@node label must be of type string`,
        directive,
        path
      );

      throw error;
    }
  }

  const invalidArgs = directive.arguments.filter(
    (x) => !["label"].includes(x.name.value)
  );
  if (invalidArgs.length) {
    const error = locatedError(
      `@node invalid argument(s) ${invalidArgs
        .map((x) => x.name.value)
        .join(", ")}`,
      directive,
      path
    );

    throw error;
  }
}

export default validateNodeDirective;
