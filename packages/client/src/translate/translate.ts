import { FieldNode, OperationDefinitionNode, SelectionNode } from "graphql";
import { Query, Translation } from "../types";
import createMatchAndParams from "./create-match-and-params";
import { queryToDocument } from "../utils";

function translate({
    query,
    variables = {},
}: {
    query: Query;
    variables?: Record<string, unknown>;
}): Translation {
    const document = queryToDocument(query);
    const root = document.definitions[0] as OperationDefinitionNode;
    const cyphers: string[] = [];
    let params: Record<string, unknown> = {};
    const selections = root.selectionSet.selections.filter(
        (f) => f.kind === "Field" && ["MATCH"].includes(f.name.value)
    ) as FieldNode[];

    selections.forEach((field: SelectionNode) => {
        if (field.kind !== "Field") {
            return;
        }

        if (field.name.value !== "MATCH") {
            return;
        }

        const [match, mParams] = createMatchAndParams({
            matchField: field,
            variables,
        });
        cyphers.push(match);
        params = { ...params, ...mParams };
    });

    const returnVariables = {
        MATCH: selections
            .filter((x) => x.name.value === "MATCH")
            .flatMap((x) =>
                (x.selectionSet?.selections as FieldNode[]).map(
                    (y) => y.name.value
                )
            ),
    };

    cyphers.push(`RETURN ${returnVariables.MATCH.join(", ")}`);
    params = { params: { ...params } };

    return {
        cypher: cyphers.join("\n"),
        params,
        returnVariables: {
            MATCH: selections
                .filter((x) => x.name.value === "MATCH")
                .flatMap((x) =>
                    (x.selectionSet?.selections as FieldNode[]).map(
                        (y) => y.name.value
                    )
                ),
        },
    };
}

export default translate;
