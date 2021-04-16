import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "./neo4j";
import { Client } from "../../src";
import gql from "graphql-tag";

describe("update", () => {
  let driver: Driver;

  beforeAll(async () => {
    driver = await neo4j();
  });

  afterAll(async () => {
    await driver.close();
  });

  test("should update a node property", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const id = generate({
      charset: "alphabetic",
    });

    const name = generate({
      charset: "alphabetic",
    });

    const query = gql`
        {
            UPDATE {
                node @node {
                    WHERE {
                        id(equal: "${id}")
                    }
                    SET {
                        name(value: "${name}")
                    }
                    PROJECT {
                        id
                        name
                    }
                }
            }
            RETURN {
                node
            }
        }
    `;

    try {
      await session.run(
        `
          CREATE ({id: "${id}"})
        `
      );

      const res = await client.run({ query });

      expect(res.node[0].id).toEqual(id);
      expect(res.node[0].name).toEqual(name);
    } finally {
      await session.close();
    }
  });

  describe("@edge", () => {
    describe("CREATE", () => {
      test("should update node and CREATE @edge", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const id1 = generate({
          charset: "alphabetic",
        });

        const id2 = generate({
          charset: "alphabetic",
        });

        const query = gql`
            {
                UPDATE {
                    node @node {
                        WHERE {
                            id(equal: "${id1}")
                        }
                        CREATE @edge(type: HAS_NODE, direction: OUT) {
                          NODE {
                            SET {
                              id(value: "${id2}")
                            }
                          }
                        }
                        PROJECT {
                            id
                            edges @edge(type: HAS_NODE, direction: OUT) @node {
                              id
                            }
                        }
                    }
                }
                RETURN {
                    node
                }
            }
        `;

        try {
          await session.run(
            `
              CREATE ({id: "${id1}"})
            `
          );

          const res = await client.run({ query });
          expect(res.node[0].id).toEqual(id1);
          expect(res.node[0].edges).toEqual([{ id: id2 }]);
        } finally {
          await session.close();
        }
      });
    });

    describe("CONNECT", () => {
      test("should update node and CONNECT @edge", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const id1 = generate({
          charset: "alphabetic",
        });

        const id2 = generate({
          charset: "alphabetic",
        });

        const query = gql`
            {
                UPDATE {
                    node @node {
                        WHERE {
                            id(equal: "${id1}")
                        }
                        CONNECT @edge(type: HAS_NODE, direction: OUT) {
                          NODE {
                            WHERE {
                              id(equal: "${id2}")
                            }
                          }
                        }
                        PROJECT {
                            id
                            edges @edge(type: HAS_NODE, direction: OUT) @node {
                              id
                            }
                        }
                    }
                }
                RETURN {
                    node
                }
            }
        `;

        try {
          await session.run(
            `
              CREATE ({id: "${id1}"})
              CREATE ({id: "${id2}"})
            `
          );

          const res = await client.run({ query });
          expect(res.node[0].id).toEqual(id1);
          expect(res.node[0].edges).toEqual([{ id: id2 }]);
        } finally {
          await session.close();
        }
      });
    });

    describe("UPDATE", () => {
      test("should update node and UPDATE @edge", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const id1 = generate({
          charset: "alphabetic",
        });

        const id2 = generate({
          charset: "alphabetic",
        });

        const id3 = generate({
          charset: "alphabetic",
        });

        const relId = generate({
          charset: "alphabetic",
        });

        const query = gql`
            {
                UPDATE {
                    node @node {
                        WHERE {
                            id(equal: "${id1}")
                        }
                        UPDATE @edge(type: HAS_NODE, direction: OUT) {
                          NODE {
                            WHERE {
                              id(equal: "${id2}")
                            }
                            SET {
                              id(value: "${id3}")
                            }
                          }
                          PROPERTIES {
                            SET {
                              id(value: "${relId}")
                            }
                          }
                        }
                        PROJECT {
                            id
                            edges @edge(type: HAS_NODE, direction: OUT)  {
                              to @node {
                                PROJECT {
                                  id
                                }
                              }
                              PROPERTIES {
                                PROJECT {
                                  id
                                }
                              }
                            }
                        }
                    }
                }
                RETURN {
                    node
                }
            }
        `;

        try {
          await session.run(
            `
              CREATE (one {id: "${id1}"})
              CREATE (two {id: "${id2}"})
              MERGE (one)-[:HAS_NODE]->(two)
            `
          );

          const res = await client.run({ query });
          expect(res.node[0].id).toEqual(id1);
          expect(res.node[0].edges).toEqual([
            { to: { id: id3 }, PROPERTIES: { id: relId } },
          ]);
        } finally {
          await session.close();
        }
      });
    });

    describe("DISCONNECT", () => {
      test("should DISCONNECT a node edge", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const id1 = generate({
          charset: "alphabetic",
        });

        const id2 = generate({
          charset: "alphabetic",
        });

        const id3 = generate({
          charset: "alphabetic",
        });

        const query = gql`
          {
              UPDATE {
                  node @node {
                      WHERE {
                          id(equal: "${id1}")
                      }
                      DISCONNECT @edge(type: HAS_NODE, direction: OUT) {
                        NODE {
                          WHERE {
                            id(equal: "${id2}")
                          }
                        }
                      }
                      PROJECT {
                          id
                          edges @edge(type: HAS_NODE, direction: OUT) @node {
                            id
                          }
                      }
                  }
              }
              RETURN {
                  node
              }
          }
      `;

        try {
          await session.run(
            `
            CREATE (one {id: "${id1}"})
            CREATE (two {id: "${id2}"})
            CREATE (three {id: "${id3}"})
            MERGE (one)-[:HAS_NODE]->(two)
            MERGE (one)-[:HAS_NODE]->(three)
          `
          );

          const res = await client.run({ query });
          expect(res.node[0].id).toEqual(id1);
          expect(res.node[0].edges).toEqual([{ id: id3 }]);
        } finally {
          await session.close();
        }
      });
    });
  });
});
