import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "./neo4j";
import { Client } from "../../src";
import gql from "graphql-tag";

describe("match", () => {
  let driver: Driver;

  beforeAll(async () => {
    driver = await neo4j();
  });

  afterAll(async () => {
    await driver.close();
  });

  test("should find nodes", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const id = generate({
      charset: "alphabetic",
    });

    const query = gql`
        {
            MATCH {
                test @node(label: "${id}") {
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
            CREATE (:${id} {id: $id})
        `,
        { id }
      );

      const result = await client.run({ query });

      expect(result?.test).toEqual([{ id }]);
    } finally {
      await session.close();
    }
  });

  test("should preform many matches", async () => {
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
            MATCH {
                test1 @node(label: "${id1}") {
                    PROJECT {
                        id
                    }
                }
                test2 @node(label: "${id2}") {
                    PROJECT {
                        id
                    }
                }
            }
            RETURN {
                test1
                test2
            }
        }
    `;

    try {
      await session.run(
        `
            CREATE (:${id1} {id: $id1}), (:${id2} {id: $id2})
        `,
        { id1, id2 }
      );

      const result = await client.run({ query });

      expect(result?.test1).toEqual([{ id: id1 }]);
      expect(result?.test2).toEqual([{ id: id2 }]);
    } finally {
      await session.close();
    }
  });

  test("should match and project nested node", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const id1 = generate({
      charset: "alphabetic",
    });

    const id2 = generate({
      charset: "alphabetic",
    });

    const type = generate({
      charset: "alphabetic",
    });

    const direction = "OUT";

    const query = gql`
        {
            MATCH {
                test1 @node(label: "${id1}") {
                    PROJECT {
                        id
                        nodes @edge(type: "${type}", direction: "${direction}") {
                            test2 @node(label: "${id2}") {
                                PROJECT {
                                    id
                                }
                            }
                        }
                    }
                }
            }
            RETURN {
                test1
            }
        }
    `;

    try {
      await session.run(
        `
            CREATE (:${id1} {id: $id1})-[:${type}]->(:${id2} {id: $id2})
        `,
        { id1, id2 }
      );

      const result = await client.run({ query });

      expect(result?.test1).toEqual([
        { id: id1, nodes: [{ test2: { id: id2 } }] },
      ]);
    } finally {
      await session.close();
    }
  });

  test("should match and project nested node (with shorthand)", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const id1 = generate({
      charset: "alphabetic",
    });

    const id2 = generate({
      charset: "alphabetic",
    });

    const type = generate({
      charset: "alphabetic",
    });

    const direction = "OUT";

    const query = gql`
        {
            MATCH {
                test1 @node(label: "${id1}") {
                    PROJECT {
                        id
                        nodes @edge(type: "${type}", direction: "${direction}") @node(label: "${id2}") {
                            id
                        }
                    }
                }
            }
            RETURN {
                test1
            }
        }
    `;

    try {
      await session.run(
        `
            CREATE (:${id1} {id: $id1})-[:${type}]->(:${id2} {id: $id2})
        `,
        { id1, id2 }
      );

      const result = await client.run({ query });

      expect(result?.test1).toEqual([{ id: id1, nodes: [{ id: id2 }] }]);
    } finally {
      await session.close();
    }
  });

  test("should match and project multi nested nodes", async () => {
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

    const type = generate({
      charset: "alphabetic",
    });

    const direction = "OUT";

    const query = gql`
        {
            MATCH {
                users @node(label: "${id1}") {
                    PROJECT {
                        id
                        content @edge(type: "${type}", direction: "${direction}") {
                            photo @node(label: "${id2}") {
                                PROJECT {
                                    id
                                }
                            }
                            video @node(label: "${id3}") {
                                PROJECT {
                                    id
                                }
                            }
                        }
                    }
                }
            }
            RETURN {
                users
            }
        }
    `;

    try {
      await session.run(
        `
            CREATE (user:${id1} {id: $id1})
            CREATE (photo:${id2} {id: $id2})
            CREATE (video:${id3} {id: $id3})
            MERGE (user)-[:${type}]->(photo)
            MERGE (user)-[:${type}]->(video)
        `,
        { id1, id2, id3 }
      );

      const result = await client.run({ query });
      const user = result.users[0];
      expect(user.id).toEqual(id1);
      const photo = user?.content.find((x) => x.photo);
      expect(photo.photo.id).toEqual(id2);
      const video = user?.content.find((x) => x.video);
      expect(video.video.id).toEqual(id3);
    } finally {
      await session.close();
    }
  });

  test("should match and project nested relationship property", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const id1 = generate({
      charset: "alphabetic",
    });

    const id2 = generate({
      charset: "alphabetic",
    });

    const type = generate({
      charset: "alphabetic",
    });

    const direction = "OUT";

    const query = gql`
        {
            MATCH {
                test1 @node(label: "${id1}") {
                    PROJECT {
                        id
                        nodes @edge(type: "${type}", direction: "${direction}") {
                            test2 @node(label: "${id2}")
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
                test1
            }
        }
    `;

    try {
      await session.run(
        `
            CREATE (:${id1} {id: $id1})-[:${type} {id: $id2}]->(:${id2})
        `,
        { id1, id2 }
      );

      const result = await client.run({ query });

      expect(result?.test1).toEqual([
        { id: id1, nodes: [{ PROPERTIES: { id: id2 } }] },
      ]);
    } finally {
      await session.close();
    }
  });

  test("should match and project nested node and relationship property", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const id1 = generate({
      charset: "alphabetic",
    });

    const id2 = generate({
      charset: "alphabetic",
    });

    const type = generate({
      charset: "alphabetic",
    });

    const direction = "OUT";

    const query = gql`
        {
            MATCH {
                test1 @node(label: "${id1}") {
                    PROJECT {
                        id
                        nodes @edge(type: "${type}", direction: "${direction}") {
                            node @node(label: "${id2}") {
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
                test1
            }
        }
    `;

    try {
      await session.run(
        `
            CREATE (:${id1} {id: $id1})-[:${type} {id: $id2}]->(:${id2} {id: $id2})
        `,
        { id1, id2 }
      );

      const result = await client.run({ query });

      expect(result?.test1).toEqual([
        {
          id: id1,
          nodes: [{ node: { id: id2 }, PROPERTIES: { id: id2 } }],
        },
      ]);
    } finally {
      await session.close();
    }
  });

  describe("edge", () => {
    test("should find nodes with where on edge node", async () => {
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
                MATCH {
                    nodes @node {
                        WHERE {
                            EDGE(type: HAS_NODE, direction: OUT) {
                                NODE {
                                    id(equal: "${id2}")
                                }
                            }
                        }
                        PROJECT {
                            id
                        }
                    }
                }
                RETURN {
                    nodes
                }
            }
        `;

      try {
        await session.run(
          `
            CREATE (first {id: $id1})
            CREATE (second {id: $id2})
            MERGE (first)-[:HAS_NODE]->(second)
          `,
          { id1, id2 }
        );

        const result = await client.run({ query });

        expect(result?.nodes).toEqual([{ id: id1 }]);
      } finally {
        await session.close();
      }
    });
  });

  describe("@cypher", () => {
    describe("top-level", () => {
      test("should return top-level custom cypher (primitive)", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const query = gql`
          {
            MATCH {
              number
                @cypher(
                  arguments: { number: $number }
                  statement: "RETURN $number"
                )
            }
            RETURN {
              number
            }
          }
        `;

        try {
          const number = 1;

          const result = await client.run({
            query,
            variables: { number },
          });

          expect(result?.number).toEqual([number]); // array because of the way neo4j works
        } finally {
          await session.close();
        }
      });

      test("should return top-level custom cypher (object)", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const id = generate({
          charset: "alphabetic",
        });

        const query = gql`
            {
                MATCH {
                    nodes @cypher(statement: "MATCH (n:${id}) RETURN n") {
                        id
                    }
                }
                RETURN {
                    nodes
                }
            }
        `;

        try {
          await session.run(
            `
                CREATE (first:${id} {id: $id})
            `,
            { id }
          );

          const result = await client.run({ query });

          expect(result?.nodes).toEqual([{ id: id }]);
        } finally {
          await session.close();
        }
      });
    });

    describe("field-level", () => {
      test("should return field-level custom cypher (primitive)", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const id = generate({
          charset: "alphabetic",
        });

        const query = gql`
            {
                MATCH {
                    nodes @node(label: ${id}) {
                        PROJECT {
                            id
                            number
                                @cypher(
                                    arguments: { number: $number }
                                    statement: """
                                    RETURN $number
                                    """
                                )
                        }
                    }
                }
                RETURN {
                    nodes
                }
            }
        `;

        try {
          const number = 1999;

          await session.run(
            `
                CREATE (first:${id} {id: $id})
            `,
            { id }
          );

          const result = await client.run({
            query,
            variables: { number: number },
          });

          expect(result?.nodes).toEqual([{ id, number }]);
        } finally {
          await session.close();
        }
      });

      test("should return field-level custom cypher (object)", async () => {
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
                MATCH {
                    nodes @node {
                        WHERE {
                            id(equal: "${id1}")
                        }
                        PROJECT {
                            id
                            nodes
                                @cypher(
                                    statement: """
                                    MATCH (this)-[:HAS_NODE]->(node)
                                    RETURN node
                                    """
                                ) {
                                id
                            }
                        }
                    }
                }
                RETURN {
                    nodes
                }
            }
        `;

        try {
          await session.run(
            `
                CREATE (first {id: $id1})
                CREATE (second {id: $id2})
                MERGE (first)-[:HAS_NODE]->(second)
            `,
            { id1, id2 }
          );

          const result = await client.run({ query });

          expect(result?.nodes).toEqual([{ id: id1, nodes: [{ id: id2 }] }]);
        } finally {
          await session.close();
        }
      });
    });
  });
});
