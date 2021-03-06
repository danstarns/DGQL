# schemaless-graphql-neo4j

Turn untyped & dynamic GraphQL queries into Cypher.

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

GraphQL can be separated into two sections; language & execution. To truly understand this implementation one should first remove them selfs from the conventional execution paradigms, say using Apollo Server, and understand the rich tooling surrounding just the language. This implementation fundamentally concerns itself with the AST produced from a given selection. Traversal of the AST enables the translator to generate Cypher via; picking up on Client Directives that give the query context.

Given the below;

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

the following Cypher is produced;

```cypher
MATCH (user:User)
WHERE user.name = "Dan"
RETURN user {
    .id,
    posts: [ (user)-[:HAS_POSTS]->(posts:Post) | { node: { title: posts.title } } ]
} as user
```

The lack of schema means no validation or type checking is performed, usually the expensive part of GraphQL execution. The flip-side to this is that; you can formulate ad-hoc queries using a maybe more familiar language; GraphQL. Using this language enables developers to receive a JSON like structure, similar in-shape to there formulated query, thus making the response more predictable & easier to manage.

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

#### Match many nodes

```graphql
{
    match {
        user @node(label: "User") {
            name
        }
        post @node(label: "Post") {
            content
        }
    }
}
```

#### Match and project relationships

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
