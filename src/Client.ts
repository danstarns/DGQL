import * as neo4j from "neo4j-driver";
import { translate } from "./translate";
import { Query, Translation } from "./types";
import { execute } from "./utils";

class Client {
    driver: neo4j.Driver;

    constructor(input: { driver: neo4j.Driver }) {
        this.driver = input.driver;
    }

    translate({
        query,
        variables,
    }: {
        query: Query;
        variables: Record<string, unknown>;
    }): Translation {
        return translate({ query, variables });
    }

    async run<T = any>({
        query,
        variables = {},
    }: {
        query: Query;
        variables?: Record<string, unknown>;
    }): Promise<T> {
        const translation = translate({
            query,
            variables,
        });

        return (execute({
            ...translation,
            driver: this.driver,
        }) as unknown) as T;
    }
}

export default Client;
