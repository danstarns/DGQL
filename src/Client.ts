import * as neo4j from "neo4j-driver";
import { translate } from "./translate";
import { Query, Translation } from "./types";
import { execute } from "./utils";

class Client {
    driver: neo4j.Driver;

    constructor(input: { driver: neo4j.Driver }) {
        this.driver = input.driver;
    }

    translate({ query }: { query: Query }): Translation {
        return translate({ query });
    }

    async run<T = any>({ query }: { query: Query }): Promise<T> {
        const translation = translate({
            query,
        });

        return (execute({
            ...translation,
            driver: this.driver,
        }) as unknown) as T;
    }
}

export default Client;
