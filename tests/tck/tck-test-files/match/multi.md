## Multi Match

---

### Multi Node

**Input GraphQL**

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

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    RETURN user { name: user.name } as user
}

CALL {
    MATCH (post:Post)
    RETURN post { content: post.content } as post
}

RETURN user, post
```

**Output Cypher params**

```selection-params
{
    "params": {}
}
```

---
