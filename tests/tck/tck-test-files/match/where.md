## Match Where

---

### Match Node with Where

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: "User") {
            WHERE {
                name(EQUAL: "Dan")
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
    WHERE user.name = $params.user_name_EQUAL
    RETURN user { name: user.name } as user
}

RETURN user
```

**Output Cypher params**

```selection-params
{
    "params": {
        "user_name_EQUAL": "Dan"
    }
}
```

---
