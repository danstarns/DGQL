import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "../neo4j";
import { Client } from "../../../src";
import gql from "graphql-tag";
import isUUID from "is-uuid";

describe("uuid", () => {
  let driver: Driver;

  beforeAll(async () => {
    driver = await neo4j();
  });

  afterAll(async () => {
    await driver.close();
  });

  test("should create a node with uuid", async () => {
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
                        uuid @uuid
                    }
                    PROJECT {
                        uuid
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

      expect(
        ["v1", "v2", "v3", "v4", "v5"].some((t) => isUUID[t](node[0].uuid))
      ).toEqual(true);
    } finally {
      await session.close();
    }
  });
});
