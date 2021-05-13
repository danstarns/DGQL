import { Request, Response } from "express";
import gql from "graphql-tag";
import { client } from "../dgql";

export async function getGenre(req: Request, res: Response) {
  const variables = {
    ...(req.query.search ? { nameRegex: `(?i)${req.query.search}.*` } : {}),
  };

  const query = gql`
    {
      MATCH {
        genres @node(label: Genre) {
          WHERE {
            name(regex: $nameRegex) @include(if: $nameRegex)
          }
          PROJECT {
            genreId
            name
          }
        }
      }
      RETURN {
        genres
      }
    }
  `;

  const { genres } = await client.run({ query, variables });

  return res.json({ genres });
}

export async function createGenre(req: Request, res: Response) {
  const { genre: { name } = {} } = req.body as {
    genre: { name: string };
  };
  const variables = {
    name,
  };

  const existing = await client.run({
    query: gql`
      {
        MATCH {
          genres @node(label: Genre) @where(name: $name)
        }
        RETURN {
          genres
        }
      }
    `,
    variables,
  });

  if (existing.genres.length) {
    return res.status(500).send(`Genre ${variables.name} already exists`);
  }

  const query = gql`
    {
      CREATE {
        genre @node(label: Genre) {
          SET {
            genreId @uuid
            name(value: $name) @validate(type: String, required: true)
          }
          PROJECT {
            genreId
            name
          }
        }
      }
      RETURN {
        genre
      }
    }
  `;

  const { genre } = await client.run({ query, variables });

  return res.status(201).json({ genre: genre[0] });
}

export async function updateGenre(req: Request, res: Response) {
  const { genre: { name } = {} } = req.body as {
    genre: { name: string };
  };
  const variables = {
    genreId: req.params.id,
    name,
  };

  const { genresById } = await client.run({
    query: gql`
      {
        MATCH {
          genresById @node(label: Genre) @where(genreId: $genreId)
        }
        RETURN {
          genresById
        }
      }
    `,
    variables,
  });

  if (!genresById.length) {
    return res.status(404).end();
  }

  const { genresByName } = await client.run({
    query: gql`
      {
        MATCH @include(if: $name) {
          genresByName @node(label: Genre) @where(name: $name)
        }
        RETURN @include(if: $name) {
          genresByName
        }
      }
    `,
    variables,
  });

  if (genresByName && genresByName.length) {
    return res.status(500).send(`Genre ${variables.name} already exists`);
  }

  const query = gql`
    {
      UPDATE {
        genres @node(label: Genre) @where(genreId: $genreId) {
          SET {
            name(value: $name) @validate(type: String, required: true)
          }
          PROJECT {
            genreId
            name
          }
        }
      }
      RETURN {
        genres
      }
    }
  `;

  const { genres } = await client.run({ query, variables });

  return res.status(200).json({ genres });
}

export async function deleteGenre(req: Request, res: Response) {
  const variables = {
    genreId: req.params.id,
  };

  const query = gql`
    {
      DELETE {
        NODE(label: Genre) @detach @where(genreId: $genreId)
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
