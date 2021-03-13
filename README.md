# DGQL

> Turn untyped & dynamic GraphQL queries into Cypher.

~~Dynamic GraphQL~~

~~Dans Graph Query Language~~

Dynamic Graph Query Language 👍

## Intro

> Checkout [recipes](https://github.com/danstarns/dgql/tree/main/misc/recipes) to peek through a cookbook of DGQL queries.

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
            PROJECT {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post) {
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
            PROJECT {
                id
            }
        }
    }
    RETURN {
        user
    }
}
```

#### Match many nodes

```graphql
{
    MATCH {
        users @node(label: User) {
            PROJECT {
                name
            }
        }
        posts @node(label: Post) {
            PROJECT {
                content
            }
        }
    }
    RETURN {
        users
        posts
    }
}
```

#### Match and project connected nodes

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    node @node(label: Post) {
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

#### Match many nodes on an edge

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

#### Match and project relationship properties

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

#### Where on connected node

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

#### Where on relationship

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
            PROJECT {
                name
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
            PROJECT {
                name
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
        user @node(label: User) @paginate(skip: 10, limit: 10) {
            PROJECT {
                name
            }
        }
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
