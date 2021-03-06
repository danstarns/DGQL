# schemaless-graphql-neo4j

GraphQL to Cypher translation engine.

## Getting Started

```
$ npm install schemaless-graphql-neo4j
```

## Quick Start

```js
const { Client } = require("schemaless-graphql-neo4j");
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
    "bolt://localhost:7687",
    neo4j.auth.basic("neo4j", "password")
);

const client = new Client({ driver });

async function main() {
    const { match } = await client.run(`
        {
            match {
                user @node(label: "User") @where(name: "Dan") {
                    name
                    posts @edge(type: "HAS_POSTS", direction: "OUT") {
                        node @node(label: "Post") {
                            title
                        }
                    }
                }
            }
        }
    `);

    console.log(match.user);
    /*
        [{
            name: "Dan",
            posts: [
                {
                    node: {
                        title: "Checkout schemaless-graphql-neo4j"
                    }
                }
            ]
        }]
    */
}

main();
```

## What is it ? 🧐

Using the GraphQL parser to produce an AST from your **selection set**. Traversal of the AST enables the translator to generate cypher via; picking up on **client directives** that give the query context.

Given the following selection set;

```graphql
{
    match {
        user @node(label: "User") @where(name: "Dan") {
            name
            posts @edge(type: "HAS_POSTS", direction: "OUT") {
                node @node(label: "Post") {
                    title
                }
            }
        }
    }
}
```

the following cypher is produced;

```cypher
MATCH (user:User)
WHERE user.name = "Dan"
RETURN user {
    .id,
    photos: [ (user)-[:HAS_POSTS]->(posts:Post) | { node: { title: posts.title } } ]
} as user
```

No validation or typechecking is done; but the traversal of a AST and the recognition of directives. One couldn't use this engine with say Apollo Server.

The lack of schema means you can formulate adhoc queries, using a maybe more familiar language; GraphQL. Using this language enables developers to receive a JSON like structure, similar in-shape to there formulated query, thus making the response more predictable & easier to manage.

## Usage

### Match

#### Match node

```graphql
{
    match {
        user @node(label: "User") @where(id: 1) {
            id
        }
    }
}
```

#### Match across relationships

```graphql
{
    match {
        user @node(label: "User") @where(name: "Dan") {
            name
            posts @edge(type: "HAS_POSTS", direction: "OUT") {
                post @node(label: "Post") {
                    title
                }
                properties @relationship {
                    since
                }
            }
        }
    }
}
```

### Create

> TODO

### Update

> TODO

### Delete

> TODO
