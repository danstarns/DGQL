import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "../neo4j";
import { Client } from "../../../src";
import gql from "graphql-tag";

describe("2", () => {
  let driver: Driver;

  beforeAll(async () => {
    driver = await neo4j();
  });

  afterAll(async () => {
    await driver.close();
  });

  test("should return correct data while using 2 fragments", async () => {
    const session = driver.session();

    const client = new Client({ driver });

    const title = generate({
      charset: "alphabetic",
    });
    const genre = generate({
      charset: "alphabetic",
    });
    const person = generate({
      charset: "alphabetic",
    });

    const query = gql`
      {
        MATCH {
          movie @node(label: Movie) @where(title: "${title}") {
            PROJECT {
              title
              ...Actors
              ...Genres
            }
          }
        }
        RETURN {
          movie
        }
      }

      fragment Actors on DGQL {
        actors @edge(type: ACTED_IN, direction: IN) @node(label: Person) {
          name
        }
      }

      fragment Genres on DGQL {
        genres @edge(type: IN_GENRE, direction: OUT) @node(label: Genre) {
          name
        }
      }
    `;

    try {
      await session.run(
        `
            CREATE (m:Movie {title: "${title}"})
            CREATE (m)<-[:ACTED_IN]-(:Person {name: "${person}"})
            CREATE (m)-[:IN_GENRE]->(:Genre {name: "${genre}"})
        `
      );

      const { movie } = await client.run({ query });

      expect(movie).toEqual([
        {
          title,
          actors: [{ name: person }],
          genres: [{ name: genre }],
        },
      ]);
    } finally {
      await session.close();
    }
  });
});
