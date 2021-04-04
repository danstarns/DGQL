## `CREATE @edge`

---

### `CREATE @edge` Node

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      CREATE @edge(type: HAS_EDGE, direction: OUT) {
        NODE(label: Node)
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
    WITH node
    CALL {
        CREATE (node_create0_NODE:Node)
        RETURN node_create0_NODE
    }
    MERGE (node)-[:HAS_EDGE]-(node_create0_NODE)
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
