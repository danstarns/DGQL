import { locatedError, DirectiveNode, valueFromASTUntyped } from "graphql";

/*
    @cypher(arguments: {k:string}, statement: string)
*/
function validateCypherDirective({
  directive,
  path,
  variables,
}: {
  directive: DirectiveNode;
  path: any;
  variables: any;
}) {
  if (!directive.arguments || !directive.arguments?.length) {
    const error = locatedError(
      `@cypher requires arguments statement and or arguments`,
      directive,
      path
    );

    throw error;
  }

  const stmtArg = directive.arguments.find((x) => x.name.value === "statement");
  if (!stmtArg) {
    const error = locatedError(
      `@cypher requires argument statement`,
      directive,
      path
    );

    throw error;
  }

  if (
    stmtArg.value.kind !== "StringValue" &&
    stmtArg.value.kind !== "Variable"
  ) {
    const error = locatedError(
      `@cypher statement must be of type StringValue or Argument`,
      directive,
      path
    );

    throw error;
  }

  if (stmtArg.value.kind === "Variable") {
    const statement = (stmtArg
      ? valueFromASTUntyped(stmtArg.value, variables)
      : undefined) as string | undefined;

    if (typeof statement !== "string") {
      const error = locatedError(
        `@cypher statement must be of type string`,
        directive,
        path
      );

      throw error;
    }
  }

  const argsArg = directive.arguments.find((x) => x.name.value === "arguments");
  if (argsArg) {
    if (
      argsArg.value.kind !== "ObjectValue" &&
      argsArg.value.kind !== "Variable"
    ) {
      const error = locatedError(
        `@cypher arguments must be of type ObjectValue or Variable`,
        directive,
        path
      );

      throw error;
    }
  }

  const invalidArgs = directive.arguments.filter(
    (x) => !["arguments", "statement"].includes(x.name.value)
  );
  if (invalidArgs.length) {
    const error = locatedError(
      `@cypher invalid argument(s) ${invalidArgs
        .map((x) => x.name.value)
        .join(", ")}`,
      directive,
      path
    );

    throw error;
  }
}

export default validateCypherDirective;
