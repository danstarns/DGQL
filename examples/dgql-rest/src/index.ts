import express from "express";
import gql from "graphql-tag";
import bodyParser from "body-parser";
import * as neo4j from "neo4j-driver";
import * as dgql from "../../../packages/client";

const dgql = require("@dgql/client");

const {
  NEO4J_URI = "bolt://localhost:7687",
  NEO4J_USER = "admin",
  NEO4J_PASSWORD = "password",
} = process.env;
const HTTP_PORT = process.env.HTTP_PORT ? Number(process.env.HTTP_PORT) : 4000;

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

const app = express();
app.use(bodyParser.json());

const client = new dgql.Client({
  driver,
});

function handler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", error: error.message });
    }
  };
}

app.get(
  "/movie",
  handler(async (req, res) => {
    const variables = {
      ...(req.query.search
        ? { titleRegex: `(?i).*${req.query.search}.*` }
        : {}),
      yearSort: req.query.sort,
    };

    const query = gql`
      {
        MATCH {
          movies @node(label: Movie) {
            SORT {
              year(direction: $yearSort) @include(if: $yearSort)
            }
            WHERE {
              title(REGEX: $titleRegex) @include(if: $titleRegex)
            }
            PROJECT {
              title
              imdbRating
              year
              actors @edge(type: ACTED_IN, direction: IN) @node(label: Person) {
                name
                born
              }
            }
          }
        }
        RETURN {
          movies
        }
      }
    `;

    const { movies } = await client.run({ query, variables });

    return res.json(movies);
  })
);

app.post(
  "/movie",
  handler(async (req, res) => {
    const { movie: { title, imdbRating } = {} } = req.body as {
      movie: { title: string; imdbRating: number };
    };
    const variables = {
      title,
      imdbRating,
    };

    const query = gql`
      {
        CREATE {
          movie @node(label: Movie) {
            SET {
              movieId @uuid
              title(value: $title)
              imdbRating(value: $imdbRating)
            }
          }
        }
        RETURN {
          movie
        }
      }
    `;

    const { movie } = await client.run({ query, variables });

    return res.json(movie);
  })
);

app.put(
  "/movie/:id",
  handler(async (req, res) => {
    const { movie: { title, imdbRating } = {} } = req.body as {
      movie: { title?: string; imdbRating?: number };
    };
    const variables = {
      id: req.params.id,
      title,
      imdbRating,
    };

    const query = gql`
      {
        UPDATE {
          movies @node(label: Movie) {
            WHERE {
              id(equal: $id)
            }
            SET {
              title(value: $title) @include(if: $title)
              imdbRating(value: $imdbRating) @include(if: $imdbRating)
            }
            PROJECT {
              title
              imdbRating
              year
            }
          }
        }
        RETURN {
          movies
        }
      }
    `;

    const { movies } = await client.run({ query, variables });

    if (!movies[0]) {
      return res.status(404).end();
    }

    return res.json(movies[0]);
  })
);

app.delete(
  "/movie/:id",
  handler(async (req, res) => {
    const variables = {
      id: req.params.id,
    };

    const query = gql`
      {
        DELETE {
          NODE(label: Movie) @detach {
            WHERE {
              title(equal: $id)
            }
          }
        }
      }
    `;

    const {
      __STATS__: { nodesDeleted },
    } = await client.run({ query, variables, includeStats: true });

    if (!nodesDeleted) {
      return res.status(404).end();
    }

    return res.status(200).end();
  })
);

async function main() {
  await driver.verifyConnectivity();
  await app.listen(HTTP_PORT);
  console.log(`Online @ ${HTTP_PORT}`);
}

main();
