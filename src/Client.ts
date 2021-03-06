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

    async run<T = any>(selectionSet: SelectionSet): Promise<T | undefined> {
        const document = selectionSetToDocument(selectionSet);

        let cyphers: string[];
        let params: Record<string, unknown> = {};

        const firstOperation = document
            .definitions[0] as OperationDefinitionNode;

        const matches = firstOperation.selectionSet.selections.filter(
            (selection) =>
                selection.kind === "Field" && selection.name.value === "match"
        ) as FieldNode[];

        const [str] = createMatchAndParams({ matches });

        console.log(str);

        return;
    }
}

export default Client;
