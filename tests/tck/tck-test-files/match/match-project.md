## Match Project

---

### Match Node & Project Connection

**Input GraphQL**

```graphql
{
    match {
        user @node(label: "User") {
            name
            posts @edge(type: "HAS_POSTS", direction: "OUT") {
                post @node(label: "Post") {
                    content
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
            (user)-[:HAS_POSTS]->(post:Post) | {
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

```selection-params
{
    "params": {}
}
```

---
