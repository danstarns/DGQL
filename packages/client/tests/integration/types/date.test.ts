import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "../neo4j";
import { Client } from "../../../src";
import gql from "graphql-tag";

describe("date", () => {
  let driver: Driver;

  beforeAll(async () => {
    driver = await neo4j();
  });

  afterAll(async () => {
    await driver.close();
  });

  test("should create a node with datetime", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const label = generate({
      charset: "alphabetic",
    });

    const query = gql`
        {
            CREATE {
                node @node(label: "${label}") {
                    SET {
                        time @datetime
                    }
                    PROJECT {
                        time
                    }
                }
            }
            RETURN {
                node
            }
        }
    `;

    try {
      const { node } = await client.run({ query });

      expect(new Date(node[0].time)).toBeInstanceOf(Date);
    } finally {
      await session.close();
    }
  });

  test("should create a node with date", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const label = generate({
      charset: "alphabetic",
    });

    const query = gql`
        {
            CREATE {
                node @node(label: "${label}") {
                    SET {
                        time @date
                    }
                    PROJECT {
                        time
                    }
                }
            }
            RETURN {
                node
            }
        }
    `;

    try {
      const { node } = await client.run({ query });

      expect(new Date(node[0].time)).toBeInstanceOf(Date);
    } finally {
      await session.close();
    }
  });
});
