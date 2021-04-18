import { Request, Response } from "express";
import gql from "graphql-tag";
import { client } from "../dgql";

export async function getPerson(req: Request, res: Response) {
  const variables = {
    ...(req.query.search ? { nameRegex: `(?i)${req.query.search}.*` } : {}),
    bornSort: req.query.sort,
  };

  const query = gql`
    {
      MATCH {
        persons @node(label: Person) {
          SORT {
            born(direction: $bornSort) @include(if: $bornSort)
          }
          WHERE {
            name(regex: $nameRegex) @include(if: $nameRegex)
          }
          PROJECT {
            personId
            name
            born
            movies @edge(type: ACTED_IN, direction: OUT) @node(label: Movie) {
              movieId
              title
              imdbRating
            }
          }
        }
      }
      RETURN {
        persons
      }
    }
  `;

  const { persons } = await client.run({ query, variables });

  return res.json({ persons });
}

export async function createPerson(req: Request, res: Response) {
  const { person: { name, born } = {} } = req.body as {
    person: { name: string; born: number };
  };
  const variables = {
    name,
    born,
  };

  const query = gql`
    {
      CREATE {
        person @node(label: Person) {
          SET {
            personId @uuid
            name(value: $name) @validate(type: String, required: true)
            born(value: $born) @validate(type: Number, required: true)
          }
          PROJECT {
            personId
          }
        }
      }
      RETURN {
        person
      }
    }
  `;

  const { person } = await client.run({ query, variables });

  return res.status(201).json({ person: person[0] });
}

export async function updatePerson(req: Request, res: Response) {
  const { person: { name, born } = {} } = req.body as {
    person: { name?: string; born?: number };
  };
  const variables = {
    personId: req.params.id,
    name,
    born,
  };

  const query = gql`
    {
      UPDATE {
        persons @node(label: Person) {
          WHERE {
            personId(equal: $personId)
          }
          SET {
            name(value: $name) @include(if: $name) @validate(type: String)
            born(value: $born) @include(if: $born) @validate(type: Number)
          }
          PROJECT {
            personId
            name
            born
          }
        }
      }
      RETURN {
        persons
      }
    }
  `;

  const { persons } = await client.run({ query, variables });

  if (!persons.length) {
    return res.status(404).end();
  }

  return res.status(200).json({ persons: persons });
}

export async function deletePerson(req: Request, res: Response) {
  const variables = {
    personId: req.params.id,
  };

  const query = gql`
    {
      DELETE {
        NODE(label: Person) @detach {
          WHERE {
            personId(equal: $personId)
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
