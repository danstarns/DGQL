# schemaless-graphql-neo4j

Experimental GraphQL => Cypher translation engine using zero Type Definitions.

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
    await client.start();

    const { user } = await client.run(`
        {
            match {
                user @node(labels: ["User"]) @where(name: "Dan") {
                    name
                    posts @node(labels: ["Post"]) @relationship(type: "HAS_POSTS", direction: "OUT") {
                        title
                    }
                }
            }
        }
    `);

    console.log(user);
    /*
        {
            name: "Dan", 
            posts: [
                { title: "Checkout schemaless-graphql-neo4j" }
            ]
        }
    */

    await client.close();
}

main();
```

## What is it doing ? 🧐

Using the GraphQL parser to parse your **selection set**, along with **client directives** to generate and execute cypher.

Given then following selection set;

```graphql
{
    match {
        user @node(labels: ["User"]) @where(name: "Dan") {
            name
            posts
                @node(labels: ["Post"])
                @relationship(type: "HAS_POSTS", direction: "OUT") {
                title
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
    photos: [ (user)-[:HAS_POSTS]->(posts:Photo) | posts { .title } ]
} as user
```

## Usage

### Match

#### Match Node

```graphql
{
    match {
        user @node(labels: ["User"]) @where(id: 1) {
            id
        }
    }
}
```

#### Match Relationships

```graphql
{
    match {
        user @node(labels: ["User"]) {
            posts
                @relationship(type: "HAS_POSTS", direction: "OUT")
                @node(labels: ["Post"]) {
                title
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
