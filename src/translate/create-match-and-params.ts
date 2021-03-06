import {
    ArgumentNode,
    DirectiveNode,
    FieldNode,
    SelectionNode,
    StringValueNode,
} from "graphql";

function createMatchProjectionAndParams({
    varName,
    selections,
}: {
    varName: string;
    selections: FieldNode[];
    chainStr?: string;
}): [string, any] {
    interface Res {
        strs: string[];
        params: any;
    }

    function reducer(res: Res, value: FieldNode): Res {
        const nodeDirective = value.directives?.find(
            (x) => x.name.value === "node"
        ) as DirectiveNode;

        const relDirective = value.directives?.find(
            (x) => x.name.value === "relationship"
        ) as DirectiveNode;

        if (relDirective) {
            if (nodeDirective) {
                // todo
            }
        }

        if (!relDirective && !nodeDirective) {
            res.strs.push(`.${value.name.value}`);
        }

        return res;
    }

    const { strs, params } = selections.reduce(
        (r: Res, v: FieldNode) => reducer(r, v),
        {
            strs: [],
            params: {},
        }
    );

    return [`{ ${strs.join("\n")} }`, params];
}

function createMatchAndParams({
    matches,
}: {
    matches: FieldNode[];
}): [string, any] {
    let cyphers: string[] = [];
    let params: Record<string, unknown> = {};

    matches.forEach((match) => {
        const selections = match.selectionSet?.selections as FieldNode[];
        const root = selections[0] as FieldNode;

        const nodeDirective = root.directives?.find(
            (x) => x.name.value === "node"
        ) as DirectiveNode;

        const label = ((nodeDirective?.arguments?.find(
            (x) => x.name.value === "label"
        ) as ArgumentNode)?.value as StringValueNode)?.value;

        const varName = root.name.value;

        const matchStmt = `MATCH (${varName}${label ? `:${label}` : ""})`;
        cyphers.push(matchStmt);

        if (root.selectionSet?.selections) {
            const [projStr] = createMatchProjectionAndParams({
                varName,
                selections: root.selectionSet.selections as FieldNode[],
            });

            cyphers.push(`RETURN ${varName} ${projStr} as ${varName}`);
        } else {
            cyphers.push(`RETURN ${varName}`);
        }
    });

    return [cyphers.join("\n"), {}];
}

export default createMatchAndParams;
