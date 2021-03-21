import { ArgumentNode, DirectiveNode, valueFromASTUntyped } from "graphql";

function createWhereFromDirectiveAndParams({
    varName,
    whereDirective,
    chainStr,
    variables,
}: {
    varName: string;
    whereDirective: DirectiveNode;
    chainStr?: string;
    variables: Record<string, unknown>;
}): [string, Record<string, unknown>] {
    const params = {};

    const args = whereDirective.arguments as ArgumentNode[];

    if (!args.length) {
        return ["", {}];
    }

    const predicates: string[] = [];

    args.forEach((arg) => {
        let param: string;
        if (chainStr) {
            param = `${chainStr}_${arg.name.value}`;
        } else {
            param = `${varName}_${arg.name.value}`;
        }

        const value = valueFromASTUntyped(arg.value, variables);

        predicates.push(`${varName}.${arg.name.value} = $params.${param}`);
        params[param] = value;
    });

    return [predicates.join(" AND "), params];
}

export default createWhereFromDirectiveAndParams;
