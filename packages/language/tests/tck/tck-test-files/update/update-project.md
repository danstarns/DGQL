## `UPDATE` & `PROJECT`

---

### `UPDATE` & `PROJECT` Node

**Input GraphQL**

```graphql
{
  UPDATE {
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
  OPTIONAL MATCH (node)
  CALL apoc.do.when(node IS NOT NULL, " SET node.id = $params.node_set_id RETURN node " , "" , { params: $params, node: node } ) YIELD value AS _
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
