## Basic Match

---

### Match Node

**Input GraphQL**

```graphql
{
    match {
        user @node(label: "User") {
            name
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

RETURN user
```

**Output Cypher params**

```selection-params
{
    "params": {}
}
```

---
