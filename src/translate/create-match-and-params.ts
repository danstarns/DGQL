import {
    ArgumentNode,
    DirectiveNode,
    FieldNode,
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
    matchField,
}: {
    matchField: FieldNode;
}): [string, any] {
    let cyphers: string[] = [];
    let params: Record<string, unknown> = {};

    matchField.selectionSet?.selections.forEach((field) => {
        const root = field as FieldNode;

        const nodeDirective = root.directives?.find(
            (x) => x.name.value === "node"
        ) as DirectiveNode;

        const label = ((nodeDirective?.arguments?.find(
            (x) => x.name.value === "label"
        ) as ArgumentNode)?.value as StringValueNode)?.value;

        const varName = root.name.value;

        cyphers.push(`CALL {`);
        cyphers.push(`MATCH (${varName}${label ? `:${label}` : ""})`);

        if (root.selectionSet?.selections) {
            const [projStr] = createMatchProjectionAndParams({
                varName,
                selections: root.selectionSet.selections as FieldNode[],
            });

            cyphers.push(`RETURN ${varName} ${projStr} as ${varName}`);
        } else {
            cyphers.push(`RETURN ${varName}`);
        }

        cyphers.push(`}`); // close CALL
    });

    return [cyphers.join("\n"), params];
}

export default createMatchAndParams;
