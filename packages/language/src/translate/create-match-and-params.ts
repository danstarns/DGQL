import {
  ArgumentNode,
  DirectiveNode,
  FieldNode,
  valueFromASTUntyped,
} from "graphql";
import createWhereAndParams from "./create-where-and-params";
import createSortAndParams from "./create-sort-and-params";
import createProjectionAndParams from "./create-projection-and-params";

function createMatchAndParams({
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
    const selections = (field.selectionSet?.selections || []) as FieldNode[];
    const whereField = selections.find((x) => x.name.value === "WHERE");
    const sortField = selections.find((x) => x.name.value === "SORT");
    const projectField = selections.find((x) => x.name.value === "PROJECT");
    const nodeDirective = field.directives?.find(
      (x) => x.name.value === "node"
    ) as DirectiveNode;
    const cypherDirective = field.directives?.find(
      (x) => x.name.value === "cypher"
    ) as DirectiveNode;
    const paginateDirective = field.directives?.find(
      (x) => x.name.value === "paginate"
    ) as DirectiveNode;

    cyphers.push(`CALL {`);

    if (cypherDirective) {
      const statementArg = cypherDirective.arguments?.find(
        (x) => x.name.value === "statement"
      ) as ArgumentNode;
      const argumentsArg = cypherDirective.arguments?.find(
        (x) => x.name.value === "arguments"
      ) as ArgumentNode;

      const statement = (statementArg
        ? valueFromASTUntyped(statementArg.value, variables)
        : undefined) as string | undefined;
      const args = (argumentsArg
        ? valueFromASTUntyped(argumentsArg.value, variables)
        : {}) as Record<string, unknown>;

      const apocParams = Object.entries(args).reduce(
        (r: { strs: string[]; params: any }, entry) => {
          const argName = `${varName}_cypher_arguments_${entry[0]}`;

          return {
            strs: [...r.strs, `${entry[0]}: $params.${argName}`],
            params: { ...r.params, [argName]: entry[1] },
          };
        },
        { strs: [], params: {} }
      ) as { strs: string[]; params: any };
      params = { ...params, ...apocParams.params };

      const paramsStr = apocParams.strs.length
        ? `{ ${apocParams.strs.join(", ")} }`
        : "{}";

      if (selections.length) {
        const cpAndP = createProjectionAndParams({
          projectField: field,
          varName,
          variables,
        });
        params = { ...params, ...cpAndP[1] };

        cyphers.push(
          `RETURN head([${varName} IN apoc.cypher.runFirstColumn("${statement}", ${paramsStr}, true)  | ${varName} ${cpAndP[0]}]) AS ${varName}`
        );
      } else {
        cyphers.push(
          `RETURN apoc.cypher.runFirstColumnSingle("${statement}", ${paramsStr}) AS ${varName}`
        );
      }
    } else if (!nodeDirective) {
      throw new Error("@node required");
    } else if (nodeDirective) {
      const labelArg = (nodeDirective?.arguments || [])?.find(
        (x) => x.name.value === "label"
      ) as ArgumentNode;

      const label = labelArg
        ? valueFromASTUntyped(labelArg.value, variables)
        : (undefined as string | undefined);

      cyphers.push(`MATCH (${varName}${label ? `:${label}` : ""})`);

      if (whereField) {
        const whereAndParams = createWhereAndParams({
          varName,
          whereField,
          chainStr: `${varName}_where`,
          variables,
        });
        cyphers.push(whereAndParams[0]);
        params = { ...params, ...whereAndParams[1] };
      }

      if (sortField) {
        const sortAndParams = createSortAndParams({
          varName,
          sortField,
          variables,
        });
        cyphers.push(sortAndParams[0]);
        params = { ...params, ...sortAndParams[1] };
      }

      if (projectField) {
        const matchProjectionAndParams = createProjectionAndParams({
          varName,
          projectField,
          variables,
        });
        params = { ...params, ...matchProjectionAndParams[1] };

        cyphers.push(
          `RETURN ${varName} ${matchProjectionAndParams[0]} AS ${varName}`
        );
      } else {
        cyphers.push(`RETURN ${varName}`);
      }

      if (paginateDirective) {
        const skipArgument = paginateDirective.arguments?.find(
          (x) => x.name.value === "skip"
        ) as ArgumentNode;

        const limitArgument = paginateDirective.arguments?.find(
          (x) => x.name.value === "limit"
        ) as ArgumentNode;

        if (skipArgument) {
          const skip = valueFromASTUntyped(skipArgument.value, variables);
          cyphers.push(`SKIP ${skip}`);
        }

        if (limitArgument) {
          const limit = valueFromASTUntyped(limitArgument.value, variables);
          cyphers.push(`LIMIT ${limit}`);
        }
      }
    }

    cyphers.push(`}`); // close CALL
  });

  return [cyphers.join("\n"), params];
}

export default createMatchAndParams;