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
  const { movie: { title, imdbRating, genres, actors } = {} } = req.body as {
    movie: {
      title: string;
      imdbRating: number;
      actors?: string[];
      genres?: string[];
    };
  };
  const variables = {
    title,
    imdb: imdbRating,
    genres,
    actors,
  };

  const query = gql`
    {
      CREATE {
        movie @node(label: Movie) {
          SET {
            movieId @uuid
            title(value: $title) @validate(type: String, required: true)
            imdbRating(value: $imdb) @validate(type: Number, required: true)
          }
          CONNECT @edge(type: ACTED_IN, direction: IN) @include(if: $actors) {
            NODE(label: Person) {
              WHERE {
                personId(in: $actors)
              }
            }
          }
          CONNECT @edge(type: IN_GENRE, direction: OUT) @include(if: $genres) {
            NODE(label: Genre) {
              WHERE {
                genreId(in: $genres)
              }
            }
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
  const {
    movie: {
      title,
      imdbRating,
      addActors,
      addGenres,
      removeActors,
      removeGenres,
    } = {},
  } = req.body as {
    movie: {
      title?: string;
      imdbRating?: number;
      addActors?: string[];
      addGenres?: string[];
      removeActors?: string[];
      removeGenres?: string[];
    };
  };
  const variables = {
    movieId: req.params.id,
    title,
    imdb: imdbRating,
    addActors,
    addGenres,
    removeActors,
    removeGenres,
  };

  const query = gql`
    {
      UPDATE {
        movies @node(label: Movie) @where(movieId: $movieId) {
          SET {
            title(value: $title) @include(if: $title) @validate(type: String)
            imdbRating(value: $imdb) @include(if: $imdb) @validate(type: Number)
          }
          CONNECT
            @edge(type: ACTED_IN, direction: IN)
            @include(if: $addActors) {
            NODE(label: Person) {
              WHERE {
                personId(in: $addActors)
              }
            }
          }
          DISCONNECT
            @edge(type: ACTED_IN, direction: IN)
            @include(if: $removeActors) {
            NODE(label: Person) {
              WHERE {
                personId(in: $removeActors)
              }
            }
          }
          CONNECT
            @edge(type: IN_GENRE, direction: OUT)
            @include(if: $addGenres) {
            NODE(label: Genre) {
              WHERE {
                genreId(in: $addGenres)
              }
            }
          }
          DISCONNECT
            @edge(type: IN_GENRE, direction: OUT)
            @include(if: $removeGenres) {
            NODE(label: Genre) {
              WHERE {
                genreId(in: $removeGenres)
              }
            }
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
        NODE(label: Movie) @detach @where(movieId: $movieId)
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
