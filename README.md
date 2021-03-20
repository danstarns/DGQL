# DGQL

> Turn untyped & dynamic GraphQL queries into Cypher.

~~Dynamic GraphQL~~

~~Dans Graph Query Language~~

Dynamic Graph Query Language 👍

## Intro

> Take a look at the DGQL [recipes](https://github.com/danstarns/dgql/tree/main/misc/recipes) section!

### Documentation

You can find the [documentation here](https://github.com/danstarns/DGQL/blob/main/docs/index.md)

### Prerequisites

GraphQL can be separated into two sections; language & execution. To truly understand this implementation one should first remove themselves from the conventional execution paradigms, say using Apollo Server, and look towards the pre-made & rich tooling surrounding the language.

### What

This implementation, at its core, is a transpiler from GraphQL to Cypher and fundamentally concerns itself with the AST produced from a given selection. Traversal of the AST enables the translator to generate Cypher from picking up on Client Directives.

Given the below [DGQL Query]();

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

const match = builder.match({
    user: builder
        .node({ label: "User" })
        .where({ name: "Dan" })
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
});

builder.return({ user: match.user });
```

The following Cypher is produced;

```cypher
MATCH (user:User)
WHERE user.name = "Dan"
RETURN user {
    .id,
    .name,
    posts: [ (user)-[:HAS_POST]->(posts:Post) | { title: posts.title } ]
} as user
```

Using the [DGQL Client](https://github.com/danstarns/dgql/tree/main/packages/client) you can execute this Cypher and receive an object like;

```json
{
    "user": {
        "id": "user-id-01",
        "name": "Dan",
        "posts": [{ "title": "Checkout DGQL!" }]
    }
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
                        authors
                            @edge(type: COMMENTED, direction: IN)
                            @node(label: User) {
                            email
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
                        MATCH (this)-[:ACTED_IN|:DIRECTED|:IN_GENRE]-(overlap)-[:ACTED_IN|:DIRECTED|:IN_GENRE]-(rec:Movie)
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

### Developer tooling

Use the pre-made tools to develop with DGQL.

1. [Client](https://github.com/danstarns/dgql/tree/main/packages/client) - Translation Engine & Executable Client for DGQL Queries

2. [Builder](https://github.com/danstarns/dgql/tree/main/packages/builder) - DGQL Query Builder

3. [Playground](https://github.com/danstarns/dgql/tree/main/packages/playground) - Developer playground to issue DGQL queries
