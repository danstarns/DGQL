import { ArgumentNode, DirectiveNode, valueFromASTUntyped } from "graphql";

function createWhereAndParams({
    varName,
    whereDirective,
}: {
    varName: string;
    whereDirective: DirectiveNode;
}): [string, Record<string, unknown>] {
    const strs: string[] = [];
    let params: Record<string, unknown> = {};
    const args = whereDirective.arguments as ArgumentNode[];

    if (args.length) {
        strs.push("WHERE");
    }

    args.forEach((arg) => {
        const value = valueFromASTUntyped(arg.value);
        const paramName = `${varName}_${arg.name.value}`;
        params[paramName] = value;
        strs.push(`${varName}.${arg.name.value} = $params.${paramName}`);
    });

    return [strs.join("\n"), params];
}

export default createWhereAndParams;
