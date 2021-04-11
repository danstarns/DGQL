## `CREATE` & `PROJECT`

---

### `CREATE` & `PROJECT` Node

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      SET {
        id(value: "some-random-id")
      }
      PROJECT {
        id
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
    SET node.id = $params.node_set_id
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_set_id": "some-random-id"
    }
}
```

---
