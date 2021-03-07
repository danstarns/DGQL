import {
    ArgumentNode,
    DirectiveNode,
    FieldNode,
    StringValueNode,
} from "graphql";
import createWhereAndParams from "./create-where-and-params";

type Direction = "IN" | "OUT";

function createMatchProjectionAndParams({
    varName,
    returnField,
}: {
    varName: string;
    returnField: FieldNode;
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
            const subnode = (value.selectionSet
                ?.selections as FieldNode[]).find((x) =>
                x.directives?.find((d) => d.name.value === "node")
            ) as FieldNode;

            const type = ((edgeDirective.arguments?.find(
                (x) => x.name.value === "type"
            ) as ArgumentNode).value as StringValueNode).value;

            const direction: Direction = ((edgeDirective.arguments?.find(
                (x) => x.name.value === "direction"
            ) as ArgumentNode).value as StringValueNode).value as Direction;

            const subNodeDirective = subnode.directives?.find(
                (x) => x.name.value === "node"
            );
            const label = ((subNodeDirective?.arguments?.find(
                (x) => x.name.value === "label"
            ) as ArgumentNode)?.value as StringValueNode)?.value;

            const inStr = direction === "IN" ? "<-" : "-";
            const outStr = direction === "OUT" ? "->" : "-";
            const pathStr = `(${varName})${inStr}[:${type}]${outStr}(${subnode.name.value}:${label})`;

            const innerReturn = (subnode.selectionSet
                ?.selections as FieldNode[]).find(
                (x) => x.name.value === "RETURN"
            ) as FieldNode;

            const nestedMatchProjectionAndParams = createMatchProjectionAndParams(
                {
                    returnField: innerReturn,
                    varName: subnode.name.value,
                }
            );
            res.params = {
                ...res.params,
                ...nestedMatchProjectionAndParams[1],
            };

            res.strs.push(
                `${value.name.value}: [ ${pathStr} |  { ${subnode.name.value}: ${nestedMatchProjectionAndParams[0]} } ]`
            );
        }

        if (!edgeDirective && !nodeDirective) {
            res.strs.push(
                `${value.name.value}: ${varName}.${value.name.value}`
            );
        }

        return res;
    }

    const { strs, params } = (returnField.selectionSet
        ?.selections as FieldNode[]).reduce(
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
        const varName = field.name.value;
        const selections = field.selectionSet?.selections as FieldNode[];
        const whereField = selections.find((x) => x.name.value === "WHERE");
        const returnField = selections.find((x) => x.name.value === "RETURN");
        const nodeDirective = field.directives?.find(
            (x) => x.name.value === "node"
        ) as DirectiveNode;
        const label = ((nodeDirective?.arguments?.find(
            (x) => x.name.value === "label"
        ) as ArgumentNode)?.value as StringValueNode)?.value;

        cyphers.push(`CALL {`);
        cyphers.push(`MATCH (${varName}${label ? `:${label}` : ""})`);

        if (whereField) {
            const whereAndParams = createWhereAndParams({
                varName,
                whereField,
            });
            cyphers.push(whereAndParams[0]);
            params = { ...params, ...whereAndParams[1] };
        }

        if (returnField) {
            const [projStr] = createMatchProjectionAndParams({
                varName,
                returnField,
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
