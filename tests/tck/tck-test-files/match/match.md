## Match

Tests for queries using match

---

### Match Node

**GraphQL input**

```graphql
{
    match {
        user @node(label: "User") {
            name
        }
    }
}
```

**Expected Cypher output**

```cypher
MATCH (user:User)
RETURN user { .name } as user
```

**Expected Cypher params**

```selection-params
{}
```

---
