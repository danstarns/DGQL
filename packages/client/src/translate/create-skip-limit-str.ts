import { ArgumentNode, DirectiveNode, valueFromASTUntyped } from "graphql";

function createSkipLimitStr({
    paginateDirective,
    variables,
}: {
    paginateDirective?: DirectiveNode;
    variables: Record<string, any>;
}): string {
    let sortLimitStr = "";
    if (paginateDirective) {
        const skipArgument = paginateDirective.arguments?.find(
            (x) => x.name.value === "skip"
        ) as ArgumentNode;

        const limitArgument = paginateDirective.arguments?.find(
            (x) => x.name.value === "limit"
        ) as ArgumentNode;

        if (skipArgument && !limitArgument) {
            const skip = valueFromASTUntyped(skipArgument.value, variables);
            sortLimitStr = `[${skip}..]`;
        }

        if (limitArgument && !skipArgument) {
            const limit = valueFromASTUntyped(limitArgument.value, variables);
            sortLimitStr = `[..${limit}]`;
        }

        if (limitArgument && skipArgument) {
            const skip = valueFromASTUntyped(skipArgument.value, variables);
            const limit = valueFromASTUntyped(limitArgument.value, variables);
            sortLimitStr = `[${skip}..${limit}]`;
        }
    }

    return sortLimitStr;
}

export default createSkipLimitStr;
