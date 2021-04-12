## No return

---

### Adds count(\*) when no return

**Input GraphQL**

```graphql
{
  CREATE {
    node @node
  }
}
```

**Output Cypher**

```cypher
CALL {
    CREATE (node)
    RETURN node
}

RETURN COUNT(*)
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---
