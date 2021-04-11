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

  test("should create a node (and return stats)", async () => {
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
      const { __STATS__ } = await client.run({ query, includeStats: true });

      const find = await session.run(
        `
            MATCH (n:${label})
            RETURN n
        `
      );

      expect(__STATS__.nodesCreated).toEqual(1);
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
        const [p] = products;
        expect(p.id).toEqual(product.id);

        const findCypher = `
            MATCH (product:Product {id: $id})
            CALL {
                MATCH (:Product {id: $id})-[:HAS_PHOTO]->(photo:Photo)-[:HAS_COLOR]->(photoColor)
                WITH collect(photo.id) AS photoIds, collect(photoColor.name) as photoColorNames
                RETURN photoIds, photoColorNames
            }
            RETURN product {.id, .name, photos: {ids: photoIds, colors: photoColorNames} } as product
        `;

        const find = await session.run(findCypher, { id: p.id });

        const neo4jProduct = (find.records[0].toObject() as any).product;

        expect(neo4jProduct.id).toMatch(product.id);
        expect(neo4jProduct.name).toMatch(product.name);
        expect(neo4jProduct.colors);

        expect(neo4jProduct.photos.ids.length).toEqual(2);
        neo4jProduct.photos.ids.forEach((photo) => {
          expect(photos.map((x) => x.id).includes(photo)).toBeTruthy();
        });

        expect(neo4jProduct.photos.colors.length).toEqual(2);
        neo4jProduct.photos.colors.forEach((photoColor) => {
          expect(colors.map((x) => x.name).includes(photoColor)).toBeTruthy();
        });
      } finally {
        await session.close();
      }
    });
  });
});
