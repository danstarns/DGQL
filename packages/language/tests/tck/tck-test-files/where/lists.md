## List

---

### in

**Input GraphQL**

```graphql
{
  MATCH {
    node @node {
      WHERE {
        id(in: [1])
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
    MATCH (node)
    WHERE node.id IN $params.node_where_id0_in
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_in": [1]
    }
}
```

---
