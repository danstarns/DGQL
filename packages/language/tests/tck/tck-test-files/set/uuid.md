## `SET` UUID

---

### `CREATE` Node with `@uuid`

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      SET {
        uuid @uuid
      }
    }
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
  SET node.uuid = randomUUID()
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
