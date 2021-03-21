## Match Shorthand

---

### Match Node & Project Connection Node (with shorthand)

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                posts @edge(type: HAS_POST, direction: OUT) @node(label: Post) {
                    content
                }
            }
        }
    }
    RETURN {
        user
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
            (user)-[:HAS_POST]->(posts:Post) | {
                content: posts.content
            }
        ]
    } AS user
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

### Match Node & Project Connection Node (with shorthand project and shorthand where)

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                posts
                    @edge(type: HAS_POST, direction: OUT)
                    @node(label: Post)
                    @where(id: "id") {
                    content
                }
            }
        }
    }
    RETURN {
        user
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
            (user)-[:HAS_POST]->(posts:Post) WHERE posts.id = $params.user_posts_where_id | {
                content: posts.content
            }
        ]
    } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {
        "user_posts_where_id": "id"
    }
}
```

---

### Match Node & Project Connection Node + Paginate (with shorthand)

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                posts
                    @edge(type: HAS_POST, direction: OUT)
                    @node(label: Post)
                    @paginate(skip: 1, limit: 10) {
                    content
                }
            }
        }
    }
    RETURN {
        user
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
            (user)-[:HAS_POST]->(posts:Post) | {
                content: posts.content
            }
        ][1..10]
    } AS user
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
