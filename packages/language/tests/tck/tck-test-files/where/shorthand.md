## Shorthand WHERE

---

### @where directive on match

**Input GraphQL**

```graphql
{
  MATCH {
    node @node @where(id: true) {
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
    WHERE node.id = $params.node_where_directive_id
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_directive_id": true
    }
}
```

---

### @where directive on match with where selection

**Input GraphQL**

```graphql
{
  MATCH {
    node @node @where(id: true) {
      WHERE {
        id(equal: true)
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
    WHERE node.id = $params.node_where_id0_equal AND node.id = $params.node_where_directive_id
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_equal": true,
        "node_where_directive_id": true
    }
}
```

---

### @where directive on update

**Input GraphQL**

```graphql
{
  UPDATE {
    node @node @where(id: true) {
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
    WHERE node.id = $params.node_where_directive_id
    CALL apoc.do.when(node IS NOT NULL, "
        RETURN node " , "" , { params: $params, node: node }
    ) YIELD value AS _
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_directive_id": true
    }
}
```

---

### @where directive on update with where selection

**Input GraphQL**

```graphql
{
  UPDATE {
    node @node @where(id: true) {
      WHERE {
        id(equal: true)
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
    WHERE node.id = $params.node_where_id0_equal AND node.id = $params.node_where_directive_id
    CALL apoc.do.when(node IS NOT NULL, "
        RETURN node " , "" , { params: $params, node: node }
    ) YIELD value AS _
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_directive_id": true,
        "node_where_id0_equal": true
    }
}
```

---

### @where directive on delete

**Input GraphQL**

```graphql
{
  DELETE {
    node @node @where(id: true)
  }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (delete0_node0)
    WHERE delete0_node0.id = $params.delete0_node0_where_directive_id
    DELETE delete0_node0
    RETURN COUNT(*)
}

RETURN COUNT(*)
```

**Output Cypher params**

```params
{
    "params": {
        "delete0_node0_where_directive_id": true
    }
}
```

---

### @where directive on delete with where selection

**Input GraphQL**

```graphql
{
  DELETE {
    node @node @where(id: true) {
      WHERE {
        id(equal: true)
      }
    }
  }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (delete0_node0)
    WHERE delete0_node0.id = $params.delete0_node0_where_id0_equal AND delete0_node0.id = $params.delete0_node0_where_directive_id
    DELETE delete0_node0
    RETURN COUNT(*)
}

RETURN COUNT(*)
```

**Output Cypher params**

```params
{
    "params": {
        "delete0_node0_where_directive_id": true,
        "delete0_node0_where_id0_equal": true
    }
}
```

---
