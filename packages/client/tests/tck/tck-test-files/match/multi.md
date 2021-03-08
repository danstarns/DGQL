## Multi Match

---

### Multi Node

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                name
            }
        }
        post @node(label: Post) {
            RETURN {
                content
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    RETURN user { name: user.name } AS user
}

CALL {
    MATCH (post:Post)
    RETURN post { content: post.content } AS post
}

RETURN user, post
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Multi Match

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                name
            }
        }
    }
    MATCH {
        post @node(label: Post) {
            RETURN {
                content
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    RETURN user { name: user.name } AS user
}

CALL {
    MATCH (post:Post)
    RETURN post { content: post.content } AS post
}

RETURN user, post
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---
