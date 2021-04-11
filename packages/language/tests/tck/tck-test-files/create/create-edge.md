## `CREATE @edge`

---

### `CREATE @edge` Node (without label or direction or type)

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      CREATE @edge {
        NODE
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
    CREATE (node_create0_NODE)
    RETURN node_create0_NODE
  }
  MERGE (node)-[]-(node_create0_NODE)
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
    MERGE (node)-[:HAS_EDGE]->(node_create0_NODE)
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

### `CREATE @edge` Node & `SET` Node (2 level)

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      SET {
        id(value: "some-id1")
      }
      CREATE @edge(type: HAS_EDGE, direction: OUT) {
        NODE(label: Node) {
          SET {
            id(value: "some-id2")
          }
        }
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
  WITH node
  CALL {
    CREATE (node_create1_NODE:Node)
    SET node_create1_NODE.id = $params.node_create1_NODE_set_id
    RETURN node_create1_NODE
  }
  MERGE (node)-[:HAS_EDGE]->(node_create1_NODE)
  RETURN node
}
RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_set_id": "some-id1",
      "node_create1_NODE_set_id": "some-id2"
    }
}
```

---

### `CREATE @edge` Node & `SET` Node (3 level)

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      SET {
        id(value: "some-id1")
      }
      CREATE @edge(type: HAS_EDGE, direction: OUT) {
        NODE(label: Node) {
          SET {
            id(value: "some-id2")
          }
          CREATE @edge(type: HAS_EDGE, direction: OUT) {
            NODE(label: Node) {
              SET {
                id(value: "some-id3")
              }
            }
          }
        }
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
  WITH node
  CALL {
    CREATE (node_create1_NODE:Node)
    SET node_create1_NODE.id = $params.node_create1_NODE_set_id
    WITH node_create1_NODE
    CALL {
      CREATE (node_create1_NODE_create1_NODE:Node)
      SET node_create1_NODE_create1_NODE.id = $params.node_create1_NODE_create1_NODE_set_id
      RETURN node_create1_NODE_create1_NODE
    }
    MERGE (node_create1_NODE)-[:HAS_EDGE]->(node_create1_NODE_create1_NODE)
    RETURN node_create1_NODE
  }
  MERGE (node)-[:HAS_EDGE]->(node_create1_NODE)
  RETURN node
}
RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_set_id": "some-id1",
      "node_create1_NODE_set_id": "some-id2",
      "node_create1_NODE_create1_NODE_set_id": "some-id3"
    }
}
```

---

### `CREATE @edge` Node & `SET` PROPERTIES (2 level)

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      CREATE @edge(type: HAS_EDGE, direction: OUT) {
        NODE(label: Node)
        PROPERTIES {
          SET {
            id(value: "some-id")
          }
        }
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
  MERGE (node)-[node_create0_PROPERTIES:HAS_EDGE]->(node_create0_NODE)
  SET node_create0_PROPERTIES.id = $params.node_create0_PROPERTIES_set_id
  RETURN node
}
RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_create0_PROPERTIES_set_id": "some-id"
    }
}
```

---
