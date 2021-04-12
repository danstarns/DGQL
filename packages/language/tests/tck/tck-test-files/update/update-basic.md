## `UPDATE`

---

### Update Node

**Input GraphQL**

```graphql
{
  UPDATE {
    node @node {
      SET {
        id(value: "some-id")
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
    RETURN node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_set_id": "some-id"
    }
}
```

---

### Update Many Node

**Input GraphQL**

```graphql
{
  UPDATE {
    node1 @node {
      SET {
        id(value: "some-id1")
      }
    }
    node2 @node {
      SET {
        id(value: "some-id2")
      }
    }
  }
  RETURN {
    node1
    node2
  }
}
```

**Output Cypher**

```cypher
CALL {
  OPTIONAL MATCH (node1)
  CALL apoc.do.when(node1 IS NOT NULL, " SET node1.id = $params.node1_set_id RETURN node1 " , "" , { params: $params, node1: node1 } ) YIELD value AS _
  RETURN node1
}

CALL {
  OPTIONAL MATCH (node2)
  CALL apoc.do.when(node2 IS NOT NULL, " SET node2.id = $params.node2_set_id RETURN node2 " , "" , { params: $params, node2: node2 } ) YIELD value AS _
  RETURN node2
}

RETURN node1, node2
```

**Output Cypher params**

```params
{
    "params": {
        "node1_set_id": "some-id1",
        "node2_set_id": "some-id2"
    }
}
```

---

### Many Update Node

**Input GraphQL**

```graphql
{
  UPDATE {
    node1 @node {
      SET {
        id(value: "some-id1")
      }
    }
  }
  UPDATE {
    node2 @node {
      SET {
        id(value: "some-id2")
      }
    }
  }
  RETURN {
    node1
    node2
  }
}
```

**Output Cypher**

```cypher
CALL {
  OPTIONAL MATCH (node1)
  CALL apoc.do.when(node1 IS NOT NULL, " SET node1.id = $params.node1_set_id RETURN node1 " , "" , { params: $params, node1: node1 } ) YIELD value AS _
  RETURN node1
}

CALL {
  OPTIONAL MATCH (node2)
  CALL apoc.do.when(node2 IS NOT NULL, " SET node2.id = $params.node2_set_id RETURN node2 " , "" , { params: $params, node2: node2 } ) YIELD value AS _
  RETURN node2
}

RETURN node1, node2
```

**Output Cypher params**

```params
{
    "params": {
        "node1_set_id": "some-id1",
        "node2_set_id": "some-id2"
    }
}
```

---
