import { Request, Response } from "express";
import gql from "graphql-tag";
import { client } from "../dgql";

export async function getMovie(req: Request, res: Response) {
  const variables = {
    ...(req.query.search ? { titleRegex: `(?i)${req.query.search}.*` } : {}),
    imdbRatingSort: req.query.sort,
  };

  const query = gql`
    {
      MATCH {
        movies @node(label: Movie) {
          SORT {
            imdbRating(direction: $imdbRatingSort) @include(if: $imdbRatingSort)
          }
          WHERE {
            title(regex: $titleRegex) @include(if: $titleRegex)
          }
          PROJECT {
            movieId
            title
            imdbRating
            actors @edge(type: ACTED_IN, direction: IN) @node(label: Person) {
              personId
              name
              born
            }
            genres @edge(type: IN_GENRE, direction: OUT) @node(label: Genre) {
              genreId
              name
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

  return res.json({ movies });
}

export async function createMovie(req: Request, res: Response) {
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
          PROJECT {
            movieId
          }
        }
      }
      RETURN {
        movie
      }
    }
  `;

  const { movie } = await client.run({ query, variables });

  return res.status(201).json({ movie: movie[0] });
}

export async function updateMovie(req: Request, res: Response) {
  const { movie: { title, imdbRating } = {} } = req.body as {
    movie: { title?: string; imdbRating?: number };
  };
  const variables = {
    movieId: req.params.id,
    title,
    imdbRating,
  };

  const query = gql`
    {
      UPDATE {
        movies @node(label: Movie) {
          WHERE {
            movieId(equal: $movieId)
          }
          SET {
            title(value: $title) @include(if: $title)
            imdbRating(value: $imdbRating) @include(if: $imdbRating)
          }
          PROJECT {
            movieId
            title
            imdbRating
          }
        }
      }
      RETURN {
        movies
      }
    }
  `;

  const { movies } = await client.run({ query, variables });

  if (!movies.length) {
    return res.status(404).end();
  }

  return res.status(200).json({ movies: movies });
}

export async function deleteMovie(req: Request, res: Response) {
  const variables = {
    movieId: req.params.id,
  };

  const query = gql`
    {
      DELETE {
        NODE(label: Movie) @detach {
          WHERE {
            movieId(equal: $movieId)
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
}
