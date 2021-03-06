## Match Where

---

### Match Node with Where

**Input GraphQL**

```graphql
{
    match {
        user @node(label: "User") @where(name: "Dan") {
            name
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    WHERE user.name = $params.user_name
    RETURN user { .name } as user
}

RETURN user
```

**Output Cypher params**

```selection-params
{}
```

---
