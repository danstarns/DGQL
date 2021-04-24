import { Request, Response } from "express";
import { client } from "../dgql";
import {
  Builder,
  node,
  property,
  edge,
} from "../../../../packages/builder/src";

export async function getMovie(req: Request, res: Response) {
  const builder = new Builder();
  const movies = node({ label: "Movie" });

  if (req.query.search) {
    movies.where({
      title: property({ regex: `(?i)${req.query.search}.*` }),
    });
  }

  if (req.query.sort) {
    movies.paginate({
      sort: {
        imdbRating: property({ direction: req.query.sort as "DESC" | "ASC" }),
      },
    });
  }

  const [query, variables] = builder
    .match({
      movies: movies.project({
        movieId: property(),
        title: property(),
        imdbRating: property(),
        actors: edge({
          type: "ACTED_IN",
          direction: "IN",
          node: node({ label: "Person" }),
        }).project({
          personId: property(),
          name: property(),
          born: property(),
        }),
        genres: edge({
          type: "IN_GENRE",
          direction: "OUT",
          node: node({ label: "Genre" }),
        }).project({
          genreId: property(),
          name: property(),
        }),
      }),
    })
    .return(["movies"])
    .build();

  const result = await client.run({ query, variables });

  return res.json({ movies: result.movies });
}
