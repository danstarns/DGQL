# DGQL

> Turn untyped & dynamic GraphQL queries into Cypher.

~~Dynamic GraphQL~~

~~Dans Graph Query Language~~

Dynamic Graph Query Language 👍

## Intro

1. [Client](https://github.com/danstarns/dgql/tree/main/packages/client) - Translation Engine & Executable Client for DGQL Queries

2. [Builder](https://github.com/danstarns/dgql/tree/main/packages/builder) - DGQL Query Builder

3. [Playground](https://github.com/danstarns/dgql/tree/main/packages/playground) - Graph app Developer playground to issue DGQL queries

### Documentation

- [Documentation](https://github.com/danstarns/DGQL/blob/main/docs/index.md)
- [TCK tests](https://github.com/danstarns/DGQL/tree/main/packages/client/tests/tck/tck-test-files)
- [DGQL Recipes](https://github.com/danstarns/dgql/tree/main/misc/recipes)

### TODO

The Builder or Client is not published yet. But if you want to play around with DGQL now; then install the published version of the [Playground](https://github.com/danstarns/dgql/tree/main/packages/playground). The following operations; [`MATCH`](https://github.com/danstarns/DGQL/blob/main/docs/language/match.md) & [`CREATE`](https://github.com/danstarns/DGQL/blob/main/docs/language/create.md) are in a good state to experiment with. The Builder; `MATCH` is in progress, porting `CREATE` into the builder is one of my next tasks.

- [ ] `UPDATE`
- [ ] `DELETE`
- [ ] `DISCONNECT`
- [ ] `AGGREGATE`
- [ ] Auto complete in Playground
- [ ] Property directives IE: `@datetime`, `@uuid`
- [ ] DGQL => Builder (1-1 Mapping) (only `MATCH` implemented)

### Prerequisites

GraphQL can be separated into two sections; language & execution. To truly understand this implementation one should first remove themselves from the conventional execution paradigms, say using Apollo Server, and look towards the pre-made & rich tooling surrounding the language.

[![What is graphql](https://i.gyazo.com/127d6883ae1ae024c8d05cb9fa359b0d.png)](https://gyazo.com/127d6883ae1ae024c8d05cb9fa359b0d)

To grasp this implementation one should understand the two separate sections above; **GraphQL is a query language** & a runtime for fulfilling those queries. DGQL completely breaks the rules 😲 and throws away the runtime, simply focusing on the language.

### What

This implementation, at its core, is a transpiler from GraphQL to Cypher and fundamentally concerns itself with the AST produced from a given selection. Traversal of the AST enables the translator to generate Cypher from picking up on Client Directives.

Given the below DGQL Query;

```graphql
{
  MATCH {
    user @node(label: User) {
      WHERE {
        name(equal: "Dan")
      }
      PROJECT {
        id
        name
        posts @edge(type: HAS_POST, direction: OUT) @node(label: Post) {
          title
        }
      }
    }
  }
  RETURN {
    user
  }
}
```

Or equivalent [DGQL Builder](./packages/builder);

```js
const { Builder, node, property, edge } = require("@dgql/builder");

const builder = new Builder();

const [dgql, variables] = builder
  .match({
    user: node({ label: "User" })
      .where({ name: property({ equal: "Dan" }) })
      .project({
        id: property(),
        name: property(),
        posts: edge({
          type: "HAS_POST",
          direction: "OUT",
          node: node({ label: "Post" }),
        }).project({
          title: property(),
        }),
      }),
  })
  .return(["user"])
  .build();
```

The following Cypher is produced;

```cypher
CALL {
  MATCH (user:User)
  WHERE user.name = "Dan"
  RETURN user {
      .id,
      .name,
      posts: [ (user)-[:HAS_POST]->(posts:Post) | { title: posts.title } ]
  } as user
}
RETURN user
```

Using the [DGQL Client](https://github.com/danstarns/dgql/tree/main/packages/client) you can execute this Cypher and receive an object like;

```json
{
  "user": [
    {
      "id": "user-id-01",
      "name": "Dan",
      "posts": [{ "title": "Checkout DGQL!" }]
    }
  ]
}
```

### Why

**Why don't you just use Cypher?** - If you are looking for a highly specific answer... Cypher may be the correct tool. If you aren't too familiar with the Cypher, and all you need is a JSON structure, similar in shape to your formulated query, then DGQL is for you. Using a DGQL query will make returning values from the database more predictable & easier to manage.

**Why does it use GraphQL?** - The GraphQL parser is a widely adopted and maintained project, meaning we can lean on its tools and infrastructure. Not only does GraphQL provide a solid foundation but also comes with developers & library authors. Finally; GraphQL directives are extremely useful and enable DGQL to facilitate powerful abstractions behind them.

**Why no Schema?** - This implementation is designed to be lightweight and run anywhere. The lack of schema facilitates this but also means no validation or type checking is performed, usually the expensive part of GraphQL execution.

## Overview

### Retrieve large subgraphs

```graphql
{
  MATCH {
    blogs @node(label: Blog) {
      PROJECT {
        name
        posts @edge(type: HAS_POST, direction: OUT) @node(label: Post) {
          title
          comments
            @edge(type: HAS_COMMENT, direction: OUT)
            @node(label: Comment) {
            content
            authors @edge(type: COMMENTED, direction: IN) @node(label: User) {
              name
            }
          }
        }
      }
    }
  }
  RETURN {
    blogs
  }
}
```

### Execute custom `@cypher`

Sometimes you may have a highly specific question, Cypher could better help you ask. Use the `@cypher` directive, in a projection, to break the flow, and execute custom cypher.

```graphql
{
  MATCH {
    movies @node(label: Movie) {
      PROJECT {
        title
        similar
          @cypher(
            arguments: { first: 3 }
            statement: """
            MATCH (this)-[:ACTED_IN|:IN_GENRE]-()-[:ACTED_IN|:IN_GENRE]-(rec:Movie)
            WITH rec, COUNT(*) AS score
            RETURN rec ORDER BY score DESC LIMIT $first
            """
          ) {
          title
          actors @edge(type: ACTED_IN, direction: IN) @node {
            name
          }
        }
      }
    }
  }
  RETURN {
    movies
  }
}
```

### Build large subgraphs

[![Image from Gyazo](https://i.gyazo.com/238741dc134077fdadfacb638c80225e.png)](https://gyazo.com/238741dc134077fdadfacb638c80225e)

```graphql
{
  CREATE {
    product @node(label: Product) {
      SET {
        id(value: "pringles_product_id")
        name(value: "Pringles")
      }
      CREATE @edge(type: HAS_PHOTO, direction: OUT) {
        NODE(label: Photo) {
          SET {
            id(value: "green_photo_id")
            url(value: "green_photo_url.com")
            name(value: "Green photo")
          }
          CONNECT @edge(type: HAS_COLOR, direction: OUT) {
            NODE(label: Color) {
              WHERE {
                name(equal: "Green")
              }
            }
          }
        }
      }
      CREATE @edge(type: HAS_PHOTO, direction: OUT) {
        NODE(label: Photo) {
          SET {
            id(value: "red_photo_id")
            url(value: "red_photo_url.com")
            name(value: "Red photo")
          }
          CONNECT @edge(type: HAS_COLOR, direction: OUT) {
            NODE(label: Color) {
              WHERE {
                name(equal: "Red")
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
    product
  }
}
```

### Play on your desktop

[Playground](https://github.com/danstarns/dgql/tree/main/packages/playground).

[![Image from Gyazo](https://i.gyazo.com/194bc89547cb025043e03f7bc0439257.gif)](https://gyazo.com/194bc89547cb025043e03f7bc0439257)
