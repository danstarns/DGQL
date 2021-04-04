import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "./neo4j";
import { Client } from "../../src";
import gql from "graphql-tag";

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

    const query = gql`
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

  test("should create a node with property", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const id = generate({
      charset: "alphabetic",
    });

    const query = gql`
        {
            CREATE {
                node @node {
                  SET {
                    id(value: "${id}")
                  }
                }
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
            MATCH (n {id: "${id}"})
            RETURN n
        `
      );

      expect(find.records[0]).toBeTruthy();
    } finally {
      await session.close();
    }
  });

  describe("edge", () => {
    describe("CREATE", () => {
      test("should create a node with an edge to a node", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const label1 = generate({
          charset: "alphabetic",
        });
        const label2 = generate({
          charset: "alphabetic",
        });

        const query = gql`
          {
            CREATE {
              node @node(label: "${label1}") {
                CREATE @edge(type: HAS_EDGE, direction: OUT) {
                  NODE(label: "${label2}")
                }
              }
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
              MATCH (one:${label1})-[:HAS_EDGE]->(two:${label2})
              RETURN one, two
          `
          );

          expect(find.records[0].get("one")).toBeTruthy();
          expect(find.records[0].get("two")).toBeTruthy();
        } finally {
          await session.close();
        }
      });

      test("should create a node with an edge to a node (while SETting values)", async () => {
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
            CREATE {
              node @node {
                SET {
                  id(value: "${id1}")
                }
                CREATE @edge(type: HAS_EDGE, direction: OUT) {
                  NODE {
                    SET {
                      id(value: "${id2}")
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
          await client.run({ query });

          const find = await session.run(
            `
              MATCH (one {id: "${id1}"})-[:HAS_EDGE]->(two {id: "${id2}"})
              RETURN one, two
          `
          );

          expect(find.records[0].get("one")).toBeTruthy();
          expect(find.records[0].get("two")).toBeTruthy();
        } finally {
          await session.close();
        }
      });

      test("should create a node with an edge to a node (while SETting relationship PROPERTIES)", async () => {
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
            CREATE {
              node @node {
                SET {
                  id(value: "${id1}")
                }
                CREATE @edge(type: HAS_EDGE, direction: OUT) {
                  NODE 
                  PROPERTIES {
                    SET {
                      id(value: "${id2}")
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
          await client.run({ query });

          const find = await session.run(
            `
              MATCH (one {id: "${id1}"})-[rel:HAS_EDGE]->(two)
              RETURN one, rel
            `
          );

          expect(find.records[0].get("one")).toBeTruthy();
          // @ts-ignore
          expect(find.records[0].toObject().rel.properties).toEqual({
            id: id2,
          });
        } finally {
          await session.close();
        }
      });
    });

    describe("CONNECT", () => {
      test("should create a node and CONNECT an edge to a node", async () => {
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
            CREATE {
              node @node {
                SET {
                  id(value: "${id1}")
                }
                CONNECT @edge(type: HAS_EDGE, direction: OUT) {
                  NODE {
                    WHERE {
                      id(equal: "${id2}")
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
              CREATE ({id: "${id2}"})
            `
          );

          await client.run({ query });

          const find = await session.run(
            `
              MATCH (one {id: "${id1}"})-[:HAS_EDGE]->(two {id: "${id2}"})
              RETURN one, two
            `
          );

          expect(find.records[0].get("one")).toBeTruthy();
          expect(find.records[0].get("two")).toBeTruthy();
        } finally {
          await session.close();
        }
      });
    });

    test("should create pringles", async () => {
      const session = driver.session();

      const client = new Client({ driver });

      const product = {
        id: generate({
          charset: "alphabetic",
        }),
        name: generate({
          charset: "alphabetic",
        }),
      };

      const colors = [
        {
          name: generate({
            charset: "alphabetic",
          }),
        },
        {
          name: generate({
            charset: "alphabetic",
          }),
        },
      ];

      const photos = [
        {
          id: generate({
            charset: "alphabetic",
          }),
          description: generate({
            charset: "alphabetic",
          }),
          url: generate({
            charset: "alphabetic",
          }),
        },
        {
          id: generate({
            charset: "alphabetic",
          }),
          description: generate({
            charset: "alphabetic",
          }),
          url: generate({
            charset: "alphabetic",
          }),
        },
      ];

      const query = gql`
        {
          CREATE {
            products @node(label: Product) {
              SET {
                id(value: "${product.id}")
                name(value: "${product.name}")
              }
              CREATE @edge(type: HAS_PHOTO, direction: OUT) {
                NODE(label: Photo) {
                  SET {
                    id(value: "${photos[0].id}")
                    url(value: "${photos[0].url}")
                    description(value: "${photos[0].description}")
                  }
                  CONNECT @edge(type: HAS_COLOR, direction: OUT) {
                    NODE(label: Color) {
                      WHERE {
                        name(equal: "${colors[0].name}") # existing color
                      }
                    }
                  }
                }
              }
              CREATE @edge(type: HAS_PHOTO, direction: OUT) {
                NODE(label: Photo) {
                  SET {
                    id(value: "${photos[1].id}")
                    url(value: "${photos[1].url}")
                    description(value: "${photos[1].description}")
                  }
                  CONNECT @edge(type: HAS_COLOR, direction: OUT) {
                    NODE(label: Color) {
                      WHERE {
                        name(equal: "${colors[1].name}") # existing color
                      }
                    }
                  }
                }
              }
              PROJECT {
                id
                name
                photos @edge(type: HAS_PHOTO, direction: OUT) @node(label: Photo) {
                  id
                  url
                  description
                  colors @edge(type: HAS_COLOR, direction: OUT) @node(label: Color) {
                    name
                  }
                }
              }
            }
          }
          RETURN {
            products
          }
        }
      `;

      try {
        await session.run(
          `
          CREATE (:Color {name: "${colors[0].name}"})
          CREATE (:Color {name: "${colors[1].name}"})
        `
        );

        const { products } = await client.run<{ products: any[] }>({ query });

        expect(products.length).toEqual(1);

        expect(products[0]).toMatchObject({
          ...product,
          photos: [
            {
              id: photos[0].id,
              url: photos[0].url,
              description: photos[0].description,
              colors: [colors[0]],
            },
            {
              id: photos[1].id,
              url: photos[1].url,
              description: photos[1].description,
              colors: [colors[1]],
            },
          ],
        });
      } finally {
        await session.close();
      }
    });
  });
});
