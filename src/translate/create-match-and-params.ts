import {
    ArgumentNode,
    DirectiveNode,
    FieldNode,
    SelectionNode,
    StringValueNode,
    valueFromASTUntyped,
} from "graphql";
import createWhereAndParams from "./create-where-and-params";

type Direction = "IN" | "OUT";

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

        const edgeDirective = value.directives?.find(
            (x) => x.name.value === "edge"
        ) as DirectiveNode;

        if (edgeDirective) {
            const type = ((edgeDirective.arguments?.find(
                (x) => x.name.value === "type"
            ) as ArgumentNode).value as StringValueNode).value;

            const direction: Direction = ((edgeDirective.arguments?.find(
                (x) => x.name.value === "direction"
            ) as ArgumentNode).value as StringValueNode).value as Direction;

            const subnode = (value.selectionSet
                ?.selections as FieldNode[]).find((x) =>
                x.directives?.find((d) => d.name.value === "node")
            ) as FieldNode;

            const subNodeDirective = subnode.directives?.find(
                (x) => x.name.value === "node"
            );

            const whereDirective = subnode.directives?.find(
                (x) => x.name.value === "where"
            ) as DirectiveNode;

            const label = ((subNodeDirective?.arguments?.find(
                (x) => x.name.value === "label"
            ) as ArgumentNode)?.value as StringValueNode)?.value;

            const inStr = direction === "IN" ? "<-" : "-";
            const outStr = direction === "OUT" ? "->" : "-";

            const pathStr = `(${varName})${inStr}[:${type}]${outStr}(${subnode.name.value}:${label})`;

            const nestedMatchProjectionAndParams = createMatchProjectionAndParams(
                {
                    selections: subnode.selectionSet?.selections as FieldNode[],
                    varName: subnode.name.value,
                }
            );
            res.params = {
                ...res.params,
                ...nestedMatchProjectionAndParams[1],
            };

            res.strs.push(
                `${value.name.value}: [ ${pathStr} |  ${nestedMatchProjectionAndParams[0]} ]`
            );
        }

        if (!edgeDirective && !nodeDirective) {
            res.strs.push(
                `${value.name.value}: ${varName}.${value.name.value}`
            );
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

    return [`{ ${strs.join(", ")} }`, params];
}

function createMatchAndParams({
    matchField,
}: {
    matchField: FieldNode;
}): [string, any] {
    let cyphers: string[] = [];
    let params: Record<string, unknown> = {};

    (matchField.selectionSet?.selections as FieldNode[]).forEach((field) => {
        const nodeDirective = field.directives?.find(
            (x) => x.name.value === "node"
        ) as DirectiveNode;

        const whereDirective = field.directives?.find(
            (x) => x.name.value === "where"
        ) as DirectiveNode;

        const label = ((nodeDirective?.arguments?.find(
            (x) => x.name.value === "label"
        ) as ArgumentNode)?.value as StringValueNode)?.value;

        const varName = field.name.value;

        cyphers.push(`CALL {`);
        cyphers.push(`MATCH (${varName}${label ? `:${label}` : ""})`);

        if (whereDirective) {
            const whereAndParams = createWhereAndParams({
                varName,
                whereDirective,
            });
            cyphers.push(whereAndParams[0]);
            params = { ...params, ...whereAndParams[1] };
        }

        if (field.selectionSet?.selections) {
            const [projStr] = createMatchProjectionAndParams({
                varName,
                selections: field.selectionSet.selections as FieldNode[],
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
