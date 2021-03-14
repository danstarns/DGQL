# DGQL

> Turn untyped & dynamic GraphQL queries into Cypher.

~~Dynamic GraphQL~~

~~Dans Graph Query Language~~

Dynamic Graph Query Language 👍

## Intro

> Take a look at the DGQL [recipes](https://github.com/danstarns/dgql/tree/main/misc/recipes) section!

### Navigating

This is a monorepo, with the following packages;

1. [Client](https://github.com/danstarns/dgql/tree/main/packages/client) - Translation Engine for DGQL
1. [Playground](https://github.com/danstarns/dgql/tree/main/packages/playground) - Developer playground to issue DGQL queries

### Prerequisites

GraphQL can be separated into two sections; language & execution. To truly understand this implementation one should first remove themselves from the conventional execution paradigms, say using Apollo Server, and look towards the pre-made & rich tooling surrounding the language.

### What

This implementation, at its core, is a transpiler from GraphQL to Cypher and fundamentally concerns itself with the AST produced from a given selection. Traversal of the AST enables the translator to generate Cypher from picking up on Client Directives.

Given the below GraphQL Query;

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

the following Cypher is produced;

```cypher
MATCH (user:User)
WHERE user.name = "Dan"
RETURN user {
    .id,
    .name,
    posts: [ (user)-[:HAS_POST]->(posts:Post) | { title: posts.title } ]
} as user
```

using the [Client](https://github.com/danstarns/dgql/tree/main/packages/client) you can execute this Cypher and receive an object like;

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

## Usage

### `@cypher`

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

### Variables

Use the `$` symbol to use variables and provide `variables` map when calling `translation` or `run`;

```js
const { user } = await client.run({ query, variables: { id: "user-id" } }); // OR
const translation = client.translate({ query, variables: { id: "user-id" } }); // OR
```

```graphql
{
    MATCH {
        user @node(label: User) {
            WHERE {
                id(equal: $id)
            }
        }
    }
    RETURN {
        user
    }
}
```

### `MATCH`

#### Match node

```graphql
{
    MATCH {
        user @node(label: User)
    }
    RETURN {
        user
    }
}
```

#### Match & project

```graphql
{
    MATCH {
        users @node(label: User) {
            PROJECT {
                name
            }
        }
    }
    RETURN {
        users
    }
}
```

#### Match and project edge node

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
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

#### Match and project many nodes on an edge

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                content @edge(type: HAS_CONTENT, direction: OUT) {
                    photo @node(label: Photo) {
                        PROJECT {
                            size
                            type
                            base64
                        }
                    }
                    video @node(label: Video) {
                        PROJECT {
                            thumbnail
                            length
                            url
                        }
                    }
                    post @node(label: Post) {
                        PROJECT {
                            title
                            content
                        }
                    }
                }
            }
        }
    }
    RETURN {
        user
    }
}
```

#### Match and project edge properties

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post)
                    properties @relationship {
                        PROJECT {
                            since
                        }
                    }
                }
            }
        }
    }
    RETURN {
        user
    }
}
```

### `WHERE`

#### Operators

See [TCK](https://github.com/danstarns/DGQL/tree/main/packages/client/tests/tck/tck-test-files/where/operators) for info on operators.

#### Where on node edge

```graphql
{
    MATCH {
        posts @node(label: Post) {
            WHERE {
                EDGE(type: HAS_POST, direction: IN) {
                    NODE(label: User) {
                        name(equal: "Dan")
                    }
                }
            }
        }
    }
    RETURN {
        posts
    }
}
```

#### Where on projection edge node

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                id
                posts @edge(type: HAS_POST, direction: OUT) {
                    node @node(label: Post) {
                        WHERE {
                            content(equal: "Cool")
                        }
                        PROJECT {
                            content
                        }
                    }
                }
            }
        }
    }
    RETURN {
        user
    }
}
```

#### Where on projection edge relationship

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                id
                posts @edge(type: HAS_POST, direction: OUT) {
                    node @node(label: Post) {
                        PROJECT {
                            content
                        }
                    }
                    properties @relationship {
                        WHERE {
                            since(equal: "1999")
                        }
                    }
                }
            }
        }
    }
    RETURN {
        user
    }
}
```

### Pagination

#### `SORT`

```graphql
{
    MATCH {
        user @node(label: User) {
            SORT {
                id(direction: DESC)
            }
        }
    }
    RETURN {
        user
    }
}
```

#### `SKIP` + `LIMIT`

```graphql
{
    MATCH {
        user @node(label: User) @paginate(skip: 10, limit: 10)
    }
    RETURN {
        user
    }
}
```

#### `SKIP` + `LIMIT` + `SORT` on connected nodes

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                posts
                    @edge(type: HAS_POST, direction: OUT)
                    @paginate(skip: 1, limit: 10) {
                    post @node {
                        SORT {
                            createdAt(direction: DESC)
                        }
                        PROJECT {
                            title
                        }
                    }
                }
            }
        }
    }
    RETURN {
        user
    }
}
```

### `CREATE`

> TODO

### `UPDATE`

> TODO

### `DELETE`

> TODO
