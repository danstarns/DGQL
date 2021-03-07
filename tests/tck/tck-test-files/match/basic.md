## Basic Match

---

### Match Node

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: "User") {
            RETURN {
                name
            }
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
