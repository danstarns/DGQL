# DGQL

> Turn untyped & dynamic GraphQL queries into Cypher.

~~Dynamic GraphQL~~

~~Dans Graph Query Language~~

Dynamic Graph Query Language 👍

## Intro

> Checkout [recipes](https://github.com/danstarns/dgql/tree/main/misc/recipes) to peek through granny's cookbook of DGQL queries.

### Navigating

This is a monorepo, with the following packages;

1. [Client](https://github.com/danstarns/dgql/tree/main/packages/client) - Translation Engine for DGQL
1. [Playground](https://github.com/danstarns/dgql/tree/main/packages/playground) - Developer playground to issue DGQL queries

### Prerequisites

GraphQL can be separated into two sections; language & execution. To truly understand this implementation one should first remove themselves from the conventional execution paradigms, say using Apollo Server, and look towards the pre-made & rich tooling surrounding the language.

### What

This implementation, at its core, is a transpiler from GraphQL to Cypher and fundamentally concerns itself with the AST produced from a given selection. Traversal of the AST enables the translator to generate Cypher from picking up on Client Directives.

Given the below;

```graphql
{
    MATCH {
        user @node(label: User) {
            WHERE {
                name(equal: "Dan")
            }
            RETURN {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post) {
                        RETURN {
                            title
                        }
                    }
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
    posts: [ (user)-[:HAS_POST]->(posts:Post) | { post: { title: posts.title } } ]
} as user
```

### Why

**Why don't you just use Cypher?** - If you have a highly specific answer... Cypher may be the right question for you. If you aren't too familiar with the Cypher, and all you need is a JSON structure, similar in shape to your formulated query, then DGQL is for you. Using a DGQL query will make returning values from the database more predictable & easier to manage.

**Why does it use GraphQL?** - The GraphQL parser is a widely adopted and maintained project, meaning we can lean on its tools and infrastructure. Not only does GraphQL provide a solid foundation but also comes with developers & library authors. Finally; GraphQL directives are extremely useful and enable DGQL to facilitate powerful abstractions behind them.

**Why no Schema?** - This implementation is designed to be lightweight and run anywhere. The lack of schema facilitates this but also means no validation or type checking is performed, usually the expensive part of GraphQL execution.

## Usage

### `MATCH`

#### Match node

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                id
            }
        }
    }
}
```

#### Match many nodes

```graphql
{
    MATCH {
        users @node(label: User) {
            RETURN {
                name
            }
        }
        posts @node(label: Post) {
            RETURN {
                content
            }
        }
    }
}
```

#### Match and project connected nodes

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    node @node(label: Post) {
                        RETURN {
                            title
                        }
                    }
                }
            }
        }
    }
}
```

#### Match and project relationship properties

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post)
                    properties @relationship {
                        RETURN {
                            since
                        }
                    }
                }
            }
        }
    }
}
```

### `WHERE`

#### Operators

See [TCK](https://github.com/danstarns/DGQL/blob/main/packages/client/tests/tck/tck-test-files/where/operators.md) for info on operators.

#### Where on connected node

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                id
                posts @edge(type: HAS_POST, direction: OUT) {
                    node @node(label: Post) {
                        WHERE {
                            content(equal: "Cool")
                        }
                        RETURN {
                            content
                        }
                    }
                }
            }
        }
    }
}
```

#### Where on relationship

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                id
                posts @edge(type: HAS_POST, direction: OUT) {
                    node @node(label: Post) {
                        RETURN {
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
}
```

### Variables

Use the `$` symbol to use variables and provide `variables` map when calling `translation` or `run`;

```js
const { MATCH } = await client.run({ query, variables: { id: "user-id" } }); // OR
const translation = client.translate({ query, variables: { id: "user-id" } }); // OR
```

```graphql
{
    MATCH {
        user @node(label: User) {
            WHERE {
                id(equal: $id)
            }
            RETURN {
                name
            }
        }
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
            RETURN {
                name
            }
        }
    }
}
```

#### `SKIP` + `LIMIT`

```graphql
{
    MATCH {
        user @node(label: User) @paginate(skip: 10, limit: 10) {
            RETURN {
                name
            }
        }
    }
}
```

#### `SKIP` + `LIMIT` + `SORT` on connected nodes

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                posts
                    @edge(type: HAS_POST, direction: OUT)
                    @paginate(skip: 1, limit: 10) {
                    post @node {
                        SORT {
                            createdAt(direction: DESC)
                        }
                        RETURN {
                            title
                        }
                    }
                }
            }
        }
    }
}
```

### `CREATE`

> TODO

### `UPDATE`

> TODO

### `DELETE`

> TODO
