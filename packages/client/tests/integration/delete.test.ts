import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "./neo4j";
import { Client } from "../../src";
import gql from "graphql-tag";

describe("delete", () => {
  let driver: Driver;

  beforeAll(async () => {
    driver = await neo4j();
  });

  afterAll(async () => {
    await driver.close();
  });

  test("should delete a node", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const label = generate({
      charset: "alphabetic",
    });

    const query = gql`
        {
            DELETE {
                NODE(label: "${label}")
            }
        }
    `;

    try {
      await session.run(
        `
            CREATE (n:${label})
        `
      );

      const { __STATS__ } = await client.run({ query, includeStats: true });

      expect(__STATS__.nodesDeleted).toEqual(1);
    } finally {
      await session.close();
    }
  });

  test("should detach delete delete a node", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const label = generate({
      charset: "alphabetic",
    });

    const query = gql`
        {
            DELETE {
                NODE(label: "${label}") @detach
            }
        }
    `;

    try {
      await session.run(
        `
            CREATE (n:${label})-[:HAS_NODE]->({id: randomUUID()})
        `
      );

      const { __STATS__ } = await client.run({ query, includeStats: true });

      expect(__STATS__.nodesDeleted).toEqual(1);
      expect(__STATS__.relationshipsDeleted).toEqual(1);
    } finally {
      await session.close();
    }
  });
});
