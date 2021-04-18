import {
  ArgumentNode,
  DirectiveNode,
  FieldNode,
  valueFromASTUntyped,
} from "graphql";

function createSetAndParams({
  setSelections,
  variables,
  varName,
}: {
  setSelections: FieldNode[];
  variables: any;
  varName: string;
}): [string, any] {
  let strs: string[] = [];
  let params = {};

  setSelections?.forEach((selection) => {
    const directives = (selection.directives || []) as DirectiveNode[];

    const uuidDirective = directives.find((x) => x.name.value === "uuid");
    if (uuidDirective) {
      strs.push(`SET ${varName}.${selection.name.value} = randomUUID()`);
      return;
    }

    const dateTimeDirective = directives.find(
      (x) => x.name.value === "datetime"
    );
    const dateDirective = directives.find((x) => x.name.value === "date");
    const validateDirectives = directives.filter(
      (x) => x.name.value === "validate"
    );

    const valueArg = (selection?.arguments || [])?.find(
      (x) => x.name.value === "value"
    ) as ArgumentNode;

    if (
      !valueArg &&
      ![dateTimeDirective, dateDirective].filter(Boolean).length
    ) {
      throw new Error("value arg required for SET.property");
    }

    const paramName = `${varName}_set_${selection.name.value}`;
    const value = valueArg
      ? valueFromASTUntyped(valueArg.value, variables)
      : undefined;
    if (value) {
      params[paramName] = value;
    }

    if (dateTimeDirective) {
      strs.push(
        `SET ${varName}.${selection.name.value} = ${
          valueArg ? `datetime($params.${paramName})` : "datetime()"
        }`
      );

      return;
    }

    if (dateDirective) {
      strs.push(
        `SET ${varName}.${selection.name.value} = ${
          valueArg ? `date($params.${paramName})` : "date()"
        }`
      );

      return;
    }

    validateDirectives.forEach((direct) => {
      const args = (direct.arguments || []) as ArgumentNode[];
      const typeArg = args.find((x) => x.name.value === "type");
      const errorArg = args.find((x) => x.name.value === "error");
      const requiredArg = args.find((x) => x.name.value === "required");
      const typeArgValue = typeArg
        ? valueFromASTUntyped(typeArg.value, variables)
        : undefined;
      const errorArgValue = errorArg
        ? valueFromASTUntyped(errorArg.value, variables)
        : undefined;
      const requiredArgValue = requiredArg
        ? valueFromASTUntyped(requiredArg.value, variables)
        : undefined;

      try {
        if (requiredArgValue && value === undefined) {
          throw new Error(`${selection.name.value} @validate required`);
        }

        if (typeArgValue) {
          const expectedTypes = ["String", "Number", "Boolean"];
          if (!expectedTypes.includes(typeArgValue)) {
            throw new Error(`@validate invalid type '${typeArgValue}'`);
          }

          const type: "String" | "Number" | "Boolean" = typeArgValue;

          if (type === "String") {
            if (typeof value !== "string") {
              throw new Error(
                `${selection.name.value} @validate invalid type expected String`
              );
            }

            const minLenArg = args.find((x) => x.name.value === "minLength");
            const maxLenArg = args.find((x) => x.name.value === "maxLength");
            const regexArg = args.find((x) => x.name.value === "regex");
            const minLenValue = minLenArg
              ? valueFromASTUntyped(minLenArg.value, variables)
              : undefined;
            const maxLenValue = maxLenArg
              ? valueFromASTUntyped(maxLenArg.value, variables)
              : undefined;
            const regexValue = regexArg
              ? valueFromASTUntyped(regexArg.value, variables)
              : undefined;

            if (typeof minLenValue === "number") {
              if (value.length < minLenValue) {
                throw new Error(
                  `${selection.name.value} @validate invalid value, expected minLength ${minLenValue}`
                );
              }
            }

            if (typeof maxLenValue === "number") {
              if (value.length > maxLenValue) {
                throw new Error(
                  `${selection.name.value} @validate invalid value, expected maxLength ${maxLenValue}`
                );
              }
            }

            if (typeof regexValue === "string") {
              const regex = new RegExp(regexValue);

              if (!regex.test(value)) {
                throw new Error(
                  `${selection.name.value} @validate invalid value, incorrect match`
                );
              }
            }
          }

          if (type === "Number") {
            if (typeof value !== "number") {
              throw new Error(
                `${selection.name.value} @validate invalid type expected Number`
              );
            }

            const minArg = args.find((x) => x.name.value === "min");
            const maxArg = args.find((x) => x.name.value === "max");
            const minValue = minArg
              ? valueFromASTUntyped(minArg.value, variables)
              : undefined;
            const maxValue = maxArg
              ? valueFromASTUntyped(maxArg.value, variables)
              : undefined;

            if (typeof minValue === "number") {
              if (value < minValue) {
                throw new Error(
                  `${selection.name.value} @validate invalid value, expected min ${minValue}`
                );
              }
            }

            if (typeof maxValue === "number") {
              if (value > maxValue) {
                throw new Error(
                  `${selection.name.value} @validate invalid value, expected max ${maxValue}`
                );
              }
            }
          }

          if (type === "Boolean") {
            if (typeof value !== "boolean") {
              throw new Error(
                `${selection.name.value} @validate invalid type expected Boolean`
              );
            }
          }
        }
      } catch (error) {
        if (errorArgValue) {
          throw new Error(errorArgValue);
        } else {
          throw error;
        }
      }
    });

    strs.push(`SET ${varName}.${selection.name.value} = $params.${paramName}`);
  });

  return [strs.join("\n"), params];
}

export default createSetAndParams;
