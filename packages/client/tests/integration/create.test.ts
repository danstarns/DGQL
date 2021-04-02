import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "./neo4j";
import { Client } from "../../src";

describe("create", () => {
  let driver: Driver;

  beforeAll(async () => {
    driver = await neo4j();
  });

  afterAll(async () => {
    await driver.close();
  });

  test("should create a node", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const label = generate({
      charset: "alphabetic",
    });

    const query = `
        {
            CREATE {
                node @node(label: "${label}")
            }
            RETURN {
                node
            }
        }
    `;

    try {
      await client.run({ query });

      const find = await session.run(
        `
            MATCH (n:${label})
            RETURN n
        `
      );

      expect(find.records[0]).toBeTruthy();
    } finally {
      await session.close();
    }
  });
});
