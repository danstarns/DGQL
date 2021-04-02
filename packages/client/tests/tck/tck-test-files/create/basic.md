## Basic Create

---

### Create Node

**Input GraphQL**

```graphql
{
  CREATE {
    node @node
  }
  RETURN {
    node
  }
}
```

**Output Cypher**

```cypher
CALL {
    CREATE (node)
    RETURN node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---
