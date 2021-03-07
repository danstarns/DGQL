import { FieldNode, OperationDefinitionNode } from "graphql";
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

        // put params in a nested object to make passing vars down easier.
        params = { params: { ...params } };

        if (noExecute) {
            return [cyphers.join("\n"), params];
        }

        const session = this.driver.session({ defaultAccessMode: "WRITE" });

        let result: neo4j.QueryResult;
        try {
            result = await session.writeTransaction((work) =>
                work.run(cyphers.join("\n"), params)
            );
        } finally {
            session.close();
        }

        const matches = (matchField.selectionSet
            ?.selections as FieldNode[]).reduce((res, selection) => {
            return {
                ...res,
                [selection.name.value]: result.records
                    .filter((x) => x.keys.includes(selection.name.value))
                    .map((x) => x.toObject()[selection.name.value]),
            };
        }, {});

        return ({ match: matches } as unknown) as T;
    }
}

export default Client;
