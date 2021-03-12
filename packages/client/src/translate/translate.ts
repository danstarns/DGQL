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
    const selections = root.selectionSet.selections;
    const matches = selections.filter(
        (f) => f.kind === "Field" && ["MATCH"].includes(f.name.value)
    ) as FieldNode[];
    const returnField = selections.find(
        (f) => f.kind === "Field" && ["RETURN"].includes(f.name.value)
    ) as FieldNode;
    const returnVariables = ((returnField?.selectionSet?.selections ||
        []) as FieldNode[]).map((s: FieldNode) => s.name.value);

    matches.forEach((field: SelectionNode) => {
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

    if (returnField) {
        cyphers.push(`RETURN ${returnVariables.join(", ")}`);
    }

    params = { params: { ...params } };

    return {
        cypher: cyphers.join("\n"),
        params,
        returnVariables,
    };
}

export default translate;
