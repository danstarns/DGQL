import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "./neo4j";
import { Client } from "../../src";
import gql from "graphql-tag";

describe("where", () => {
  let driver: Driver;

  beforeAll(async () => {
    driver = await neo4j();
  });

  afterAll(async () => {
    await driver.close();
  });

  describe("operators", () => {
    test("should find node with equal", async () => {
      const session = driver.session();

      const client = new Client({ driver });

      const label = generate({
        charset: "alphabetic",
      });
      const id = generate({
        charset: "alphabetic",
      });

      const query = gql`
            {
                MATCH {
                    test @node(label: "${label}") {
                        WHERE {
                            id(equal: ${id})
                        }
                        PROJECT {
                            id
                        }
                    }
                }
                RETURN {
                    test
                }
            }
     `;

      try {
        await session.run(
          `
            CREATE (:${label} {id: $id})
            CREATE (:${label} {id: randomUUID()})
            CREATE (:${label} {id: randomUUID()})
            CREATE (:${label} {id: randomUUID()})
         `,
          { id }
        );

        const result = await client.run({ query });

        expect(result?.test).toEqual([{ id }]);
      } finally {
        await session.close();
      }
    });
  });

  describe("nested", () => {
    test("should find nested nodes with where", async () => {
      const session = driver.session();

      const client = new Client({ driver });

      const label1 = generate({
        charset: "alphabetic",
      });
      const label2 = generate({
        charset: "alphabetic",
      });
      const id1 = generate({
        charset: "alphabetic",
      });
      const id2 = generate({
        charset: "alphabetic",
      });
      const type = generate({
        charset: "alphabetic",
      });

      const query = gql`
            {
                MATCH {
                    test @node(label: "${label1}") {
                        WHERE {
                            id(equal: "${id1}")
                        }
                        PROJECT {
                            id
                            nodes @edge(type: "${type}", direction: "OUT") {
                                node @node(label: "${label2}") {
                                    WHERE {
                                        id(equal: "${id2}")
                                    }
                                    PROJECT {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
                RETURN {
                    test
                }
            }
      `;

      try {
        await session.run(
          `
            CREATE (:${label1} {id: $id1})-[:${type}]->(:${label2} {id: $id2})
            CREATE (:${label1} {id: randomUUID()})-[:${type}]->(:${label2} {id: randomUUID()})
            CREATE (:${label1} {id: randomUUID()})-[:${type}]->(:${label2} {id: randomUUID()})
            CREATE (:${label1} {id: randomUUID()})-[:${type}]->(:${label2} {id: randomUUID()})
          `,
          { id1, id2 }
        );

        const result = await client.run({ query });

        expect(result?.test).toEqual([
          { id: id1, nodes: [{ node: { id: id2 } }] },
        ]);
      } finally {
        await session.close();
      }
    });

    test("should find nested relationships with where", async () => {
      const session = driver.session();

      const client = new Client({ driver });

      const label1 = generate({
        charset: "alphabetic",
      });
      const label2 = generate({
        charset: "alphabetic",
      });
      const id1 = generate({
        charset: "alphabetic",
      });
      const id2 = generate({
        charset: "alphabetic",
      });
      const type = generate({
        charset: "alphabetic",
      });

      const query = gql`
            {
                MATCH {
                    test @node(label: "${label1}") {
                        WHERE {
                            id(equal: "${id1}")
                        }
                        PROJECT {
                            id
                            nodes @edge(type: "${type}", direction: "OUT") {
                                node @node(label: "${label2}")
                                PROPERTIES {
                                    WHERE {
                                        id(equal: "${id2}")
                                    }
                                    PROJECT {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
                RETURN {
                    test
                }
            }
        `;

      try {
        await session.run(
          `
            CREATE (n:${label1} {id: $id1})-[:${type} {id: $id2}]->(:${label2} {id: randomUUID()})
            MERGE (n)-[:${type} {id: randomUUID()}]->(:${label2} {id: randomUUID()})
            MERGE (n)-[:${type} {id: randomUUID()}]->(:${label2} {id: randomUUID()})
            MERGE (n)-[:${type} {id: randomUUID()}]->(:${label2} {id: randomUUID()})
            MERGE (n)-[:${type} {id: randomUUID()}]->(:${label2} {id: randomUUID()})
            MERGE (n)-[:${type} {id: randomUUID()}]->(:${label2} {id: randomUUID()})
          `,
          { id1, id2 }
        );

        const result = await client.run({ query });

        expect(result?.test).toEqual([
          { id: id1, nodes: [{ PROPERTIES: { id: id2 } }] },
        ]);
      } finally {
        await session.close();
      }
    });
  });
});
