import {
    ArgumentNode,
    DirectiveNode,
    FieldNode,
    ListValueNode,
    OperationDefinitionNode,
    SelectionNode,
    ValueNode,
    valueFromASTUntyped,
    StringValueNode,
} from "graphql";
import * as neo4j from "neo4j-driver";
import { createMatchAndParams } from "./translate";
import { SelectionSet } from "./types";
import { selectionSetToDocument } from "./utils";

class Client {
    driver: neo4j.Driver;

    constructor(input: { driver: neo4j.Driver }) {
        this.driver = input.driver;
    }

    async run<T = any>({
        selectionSet,
        noExecute,
    }: {
        selectionSet: SelectionSet;
        noExecute?: boolean;
    }): Promise<T | [string, Record<string, unknown>]> {
        const document = selectionSetToDocument(selectionSet);

        const cyphers: string[] = [];
        let params: Record<string, unknown> = {};

        const firstOperation = document
            .definitions[0] as OperationDefinitionNode;

        const matchField = firstOperation.selectionSet.selections.find(
            (selection) =>
                selection.kind === "Field" && selection.name.value === "match"
        ) as FieldNode;

        const [match, mParams] = createMatchAndParams({ matchField });
        cyphers.push(match);
        params = { ...params, ...mParams };

        cyphers.push(
            `RETURN ${(matchField.selectionSet?.selections as FieldNode[])
                .map((x) => x.name.value)
                .join(", ")}`
        );

        if (noExecute) {
            return [cyphers.join("\n"), params];
        }

        console.log(cyphers.join("\n"));

        return {} as T;
    }
}

export default Client;
