## Match Project

---

### Match Node & Project Connection Node

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: "User") {
            RETURN {
                name
                posts @edge(type: "HAS_POST", direction: "OUT") {
                    post @node(label: "Post") {
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

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    RETURN user {
        name: user.name,
        posts: [
            (user)-[:HAS_POST]->(post:Post) | {
                post: {
                    content: post.content
                }
            }
        ]
    } as user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Match Node & Project Connection Properties

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: "User") {
            RETURN {
                name
                posts @edge(type: "HAS_POST", direction: "OUT") {
                    post @node(label: "Post")
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

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    RETURN user {
        name: user.name,
        posts: [
            (user)-[properties:HAS_POST]->(post:Post) | {
                properties: {
                    since: properties.since
                }
            }
        ]
    } as user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Match Node, and Project Connection Node plus Properties

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: "User") {
            RETURN {
                name
                posts @edge(type: "HAS_POST", direction: "OUT") {
                    post @node(label: "Post") {
                        RETURN {
                            id
                        }
                    }
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

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    RETURN user {
        name: user.name,
        posts: [
            (user)-[properties:HAS_POST]->(post:Post) | {
                post: {
                    id: post.id
                },
                properties: {
                    since: properties.since
                }
            }
        ]
    } as user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---
