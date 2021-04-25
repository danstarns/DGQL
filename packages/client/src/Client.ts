import * as neo4j from "neo4j-driver";
import { translate } from "../../language/src";
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
    shouldPrintError,
  }: {
    query: Query;
    variables?: Record<string, unknown>;
    shouldPrintError?: boolean;
  }): Translation {
    return translate({ query, variables, shouldPrintError });
  }

  async run<T = any>({
    query,
    variables = {},
    includeStats,
    debug,
    shouldPrintError,
  }: {
    query: Query;
    variables?: Record<string, unknown>;
    includeStats?: boolean;
    debug?: boolean;
    shouldPrintError?: boolean;
  }): Promise<T> {
    const translation = translate({
      query,
      variables,
      shouldPrintError,
    });

    if (this.debug || debug) {
      console.log("==============");
      console.log(`CYPHER:\n${formatCypher(translation.cypher)}`);
      console.log(`PARAMS:\n${JSON.stringify(translation.params, null, 2)}`);
    }

    return (execute({
      ...translation,
      driver: this.driver,
      includeStats,
    }) as unknown) as T;
  }
}

export default Client;
