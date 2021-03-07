## Match Project

---

### Match Node & Project Connection

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: "User") {
            RETURN {
                name
                posts @edge(type: "HAS_POSTS", direction: "OUT") {
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

```params
{
    "params": {}
}
```

---
