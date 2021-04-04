import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "./neo4j";
import { Client } from "../../src";
import gql from "graphql-tag";

describe("paginate", () => {
  let driver: Driver;

  beforeAll(async () => {
    driver = await neo4j();
  });

  afterAll(async () => {
    await driver.close();
  });

  describe("skip", () => {
    test("should skip a node", async () => {
      const session = driver.session();

      const client = new Client({ driver });

      const label = generate({
        charset: "alphabetic",
      });

      const id1 = 1;
      const id2 = 2;

      const query = gql`
        {
            MATCH {
                test @node(label: "${label}") @paginate(skip: 1) {
                    SORT {
                        id(direction: ASC)
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
            CREATE (:${label} {id: $id1})
            CREATE (:${label} {id: $id2})
          `,
          { id1, id2 }
        );

        const result = await client.run({ query });

        const tests = result?.test as any[];

        expect(tests).toEqual([{ id: id2 }]);
      } finally {
        await session.close();
      }
    });

    test("should skip nested nodes", async () => {
      const session = driver.session();

      const client = new Client({ driver });

      const label1 = generate({
        charset: "alphabetic",
      });
      const type = generate({
        charset: "alphabetic",
      });
      const label2 = generate({
        charset: "alphabetic",
      });
      const id1 = 1;
      const id2 = 2;

      const query = gql`
            {
                MATCH {
                    test @node(label: "${label1}") {
                        PROJECT {
                            nodes @edge(type: "${type}", direction: OUT) @paginate(skip: 1) {
                                node @node(label: "${label2}") {
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
            CREATE (n:${label1} {id: randomUUID()})
            MERGE (n)-[:${type}]->(:${label2} {id: $id1})
            MERGE (n)-[:${type}]->(:${label2} {id: $id2})
          `,
          { id1, id2 }
        );

        const result = await client.run({ query });

        const tests = result?.test as any[];

        expect(tests[0].nodes.length).toEqual(1);
      } finally {
        await session.close();
      }
    });
  });

  describe("limit", () => {
    test("should limit nodes", async () => {
      const session = driver.session();

      const client = new Client({ driver });

      const label = generate({
        charset: "alphabetic",
      });

      const id1 = 1;
      const id2 = 2;

      const query = gql`
            {
                MATCH {
                    test @node(label: "${label}") @paginate(limit: 1) {
                        SORT {
                            id(direction: ASC)
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
            CREATE (:${label} {id: $id1})
            CREATE (:${label} {id: $id2})
          `,
          { id1, id2 }
        );

        const result = await client.run({ query });

        const tests = result?.test as any[];

        expect(tests).toEqual([{ id: id1 }]);
      } finally {
        await session.close();
      }
    });

    test("should limit nested nodes", async () => {
      const session = driver.session();

      const client = new Client({ driver });

      const label1 = generate({
        charset: "alphabetic",
      });
      const type = generate({
        charset: "alphabetic",
      });
      const label2 = generate({
        charset: "alphabetic",
      });
      const id1 = 1;
      const id2 = 2;

      const query = gql`
            {
                MATCH {
                    test @node(label: "${label1}") {
                        PROJECT {
                            nodes @edge(type: "${type}", direction: OUT) @paginate(limit: 1) {
                                node @node(label: "${label2}") {
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
            CREATE (n:${label1} {id: randomUUID()})
            MERGE (n)-[:${type}]->(:${label2} {id: $id1})
            MERGE (n)-[:${type}]->(:${label2} {id: $id2})
          `,
          { id1, id2 }
        );

        const result = await client.run({ query });

        const tests = result?.test as any[];

        expect(tests[0].nodes.length).toEqual(1);
      } finally {
        await session.close();
      }
    });
  });

  describe("skip + limit", () => {
    test("should skip + limit nodes", async () => {
      const session = driver.session();

      const client = new Client({ driver });

      const label = generate({
        charset: "alphabetic",
      });

      const id1 = 1;
      const id2 = 2;
      const id3 = 3;

      const query = gql`
            {
                MATCH {
                    test @node(label: "${label}") @paginate(skip: 1, limit: 2) {
                        SORT {
                            id(direction: ASC)
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
            CREATE (:${label} {id: $id1})
            CREATE (:${label} {id: $id2})
            CREATE (:${label} {id: $id3})
          `,
          { id1, id2, id3 }
        );

        const result = await client.run({ query });

        const tests = result?.test as any[];

        expect(tests).toEqual([{ id: id2 }, { id: id3 }]);
      } finally {
        await session.close();
      }
    });

    test("should skip + limit nested nodes", async () => {
      const session = driver.session();

      const client = new Client({ driver });

      const label1 = generate({
        charset: "alphabetic",
      });
      const type = generate({
        charset: "alphabetic",
      });
      const label2 = generate({
        charset: "alphabetic",
      });
      const id1 = 1;
      const id2 = 2;
      const id3 = 3;

      const query = gql`
            {
                MATCH {
                    test @node(label: "${label1}") {
                        PROJECT {
                            nodes @edge(type: "${type}", direction: OUT) @paginate(skip: 0, limit: 2) {
                                node @node(label: "${label2}") {
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
            CREATE (n:${label1} {id: randomUUID()})
            MERGE (n)-[:${type}]->(:${label2} {id: $id1})
            MERGE (n)-[:${type}]->(:${label2} {id: $id2})
            MERGE (n)-[:${type}]->(:${label2} {id: $id3})
          `,
          { id1, id2, id3 }
        );

        const result = await client.run({ query });

        const tests = result?.test as any[];

        expect(tests[0].nodes.length).toEqual(2);
      } finally {
        await session.close();
      }
    });
  });
});
