## Match Where

---

### Match Node with Where

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: "User") {
            WHERE {
                name(equal: "Dan")
            }
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
    WHERE user.name = $params.user_name_equal
    RETURN user { name: user.name } as user
}

RETURN user
```

**Output Cypher params**

```selection-params
{
    "params": {
        "user_name_equal": "Dan"
    }
}
```

---
