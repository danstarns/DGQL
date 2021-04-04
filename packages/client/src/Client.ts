import * as neo4j from "neo4j-driver";
import { translate } from "./translate";
import { Query, Translation } from "./types";
import { execute, formatCypher } from "./utils";

class Client {
  driver: neo4j.Driver;
  debug?: boolean;

  constructor(input: { driver: neo4j.Driver; debug?: boolean }) {
    this.driver = input.driver;
    this.debug = input.debug;
  }

  translate({
    query,
    variables = {},
  }: {
    query: Query;
    variables?: Record<string, unknown>;
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

    if (this.debug) {
      console.log("==============");
      console.log(`CYPHER:\n${formatCypher(translation.cypher)}`);
      console.log(`PARAMS:\n${JSON.stringify(translation.params, null, 2)}`);
    }

    return (execute({
      ...translation,
      driver: this.driver,
    }) as unknown) as T;
  }
}

export default Client;
