import { FieldNode, OperationDefinitionNode } from "graphql";
import { Query, Translation } from "../types";
import createMatchAndParams from "./create-match-and-params";
import { queryToDocument } from "../utils";

function translate({ query }: { query: Query }): Translation {
    const document = queryToDocument(query);

    const cyphers: string[] = [];
    let params: Record<string, unknown> = {};

    const firstOperation = document.definitions[0] as OperationDefinitionNode;

    const matchField = firstOperation.selectionSet.selections.find(
        (selection) =>
            selection.kind === "Field" && selection.name.value === "MATCH"
    ) as FieldNode;

    const [match, mParams] = createMatchAndParams({ matchField });
    cyphers.push(match);
    params = { ...params, ...mParams };

    cyphers.push(
        `RETURN ${(matchField.selectionSet?.selections as FieldNode[])
            .map((x) => x.name.value)
            .join(", ")}`
    );

    // put params in a nested object to make passing vars down easier.
    params = { params: { ...params } };

    return {
        cypher: cyphers.join("\n"),
        params,
        returnVariables: {
            MATCH: (matchField.selectionSet?.selections as FieldNode[]).map(
                (x) => x.name.value
            ),
        },
    };
}

export default translate;
