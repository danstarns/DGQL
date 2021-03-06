## `CREATE` & `CONNECT @edge`

---

### `CONNECT @edge` Node (without direction)

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      CONNECT @edge(type: HAS_NODE) {
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
    WITH node
    OPTIONAL MATCH (node_connect0_NODE)
    CALL apoc.do.when(node_connect0_NODE IS NOT NULL, "
      MERGE (node)-[:HAS_NODE]-(node_connect0_NODE) " , "" , { params: $params, node_connect0_NODE: node_connect0_NODE, node: node } ) YIELD value as _
      RETURN COUNT(*)
    }
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

### `CONNECT @edge` Node with `WHERE`

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      CONNECT @edge(type: HAS_NODE, direction: IN) {
        NODE(label: Node) {
          WHERE {
            id(equal: "some-id")
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
    WITH node OPTIONAL MATCH (node_connect0_NODE:Node)
    WHERE node_connect0_NODE.id = $params.node_connect0_NODE_where_id0_equal
    CALL apoc.do.when(node_connect0_NODE IS NOT NULL, "
      MERGE (node)<-[:HAS_NODE]-(node_connect0_NODE) " , "" , { params: $params, node_connect0_NODE: node_connect0_NODE, node: node } ) YIELD value as _
      RETURN COUNT(*)
    }
  RETURN node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_connect0_NODE_where_id0_equal": "some-id"
    }
}
```

---

### `CONNECT @edge` Node with `WHERE` (Nested)

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      CONNECT @edge(type: HAS_NODE, direction: IN) {
        NODE(label: Node) {
          WHERE {
            id(equal: "some-id1")
          }
          CONNECT @edge(type: HAS_NODE, direction: OUT) {
            NODE(label: Node) {
              WHERE {
                id(equal: "some-id2")
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
  WITH node
  CALL {
    WITH node
    OPTIONAL MATCH (node_connect0_NODE:Node)
    WHERE node_connect0_NODE.id = $params.node_connect0_NODE_where_id0_equal
    CALL apoc.do.when(node_connect0_NODE IS NOT NULL, "
      MERGE (node)<-[:HAS_NODE]-(node_connect0_NODE)
      WITH node, node_connect0_NODE
      CALL {
        WITH node, node_connect0_NODE
        OPTIONAL MATCH (node_connect0_NODE_connect1_NODE:Node)
        WHERE node_connect0_NODE_connect1_NODE.id = $params.node_connect0_NODE_connect1_NODE_where_id0_equal
        CALL apoc.do.when(node_connect0_NODE_connect1_NODE IS NOT NULL, \"
          MERGE (node_connect0_NODE)-[:HAS_NODE]->(node_connect0_NODE_connect1_NODE) \" , \"\" , { params: $params, node_connect0_NODE_connect1_NODE: node_connect0_NODE_connect1_NODE, node_connect0_NODE: node_connect0_NODE } ) YIELD value as _
          RETURN COUNT(*)
      } " , "" , { params: $params, node_connect0_NODE: node_connect0_NODE, node: node } ) YIELD value as _
      RETURN COUNT(*)
  }

  RETURN node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_connect0_NODE_connect1_NODE_where_id0_equal": "some-id2",
      "node_connect0_NODE_where_id0_equal": "some-id1"
    }
}
```

---

### `CONNECT @edge` Node with `WHERE` (Nested 3x)

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      CONNECT @edge(type: HAS_NODE, direction: IN) {
        NODE(label: Node) {
          WHERE {
            id(equal: "some-id1")
          }
          CONNECT @edge(type: HAS_NODE, direction: OUT) {
            NODE(label: Node) {
              WHERE {
                id(equal: "some-id2")
              }
              CONNECT @edge(type: HAS_NODE, direction: OUT) {
                NODE(label: Node) {
                  WHERE {
                    id(equal: "some-id3")
                  }
                }
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
  WITH node
  CALL {
    WITH node
    OPTIONAL MATCH (node_connect0_NODE:Node)
    WHERE node_connect0_NODE.id = $params.node_connect0_NODE_where_id0_equal
    CALL apoc.do.when(node_connect0_NODE IS NOT NULL, "
      MERGE (node)<-[:HAS_NODE]-(node_connect0_NODE)
      WITH node, node_connect0_NODE
      CALL {
        WITH node, node_connect0_NODE
        OPTIONAL MATCH (node_connect0_NODE_connect1_NODE:Node)
        WHERE node_connect0_NODE_connect1_NODE.id = $params.node_connect0_NODE_connect1_NODE_where_id0_equal
        CALL apoc.do.when(node_connect0_NODE_connect1_NODE IS NOT NULL, \"
          MERGE (node_connect0_NODE)-[:HAS_NODE]->(node_connect0_NODE_connect1_NODE)
          WITH node, node_connect0_NODE, node_connect0_NODE_connect1_NODE
          CALL {
            WITH node, node_connect0_NODE, node_connect0_NODE_connect1_NODE
            OPTIONAL MATCH (node_connect0_NODE_connect1_NODE_connect1_NODE:Node)
            WHERE node_connect0_NODE_connect1_NODE_connect1_NODE.id = $params.node_connect0_NODE_connect1_NODE_connect1_NODE_where_id0_equal
            CALL apoc.do.when(node_connect0_NODE_connect1_NODE_connect1_NODE IS NOT NULL, \"
              MERGE (node_connect0_NODE_connect1_NODE)-[:HAS_NODE]->(node_connect0_NODE_connect1_NODE_connect1_NODE) \" , \"\" , { params: $params, node_connect0_NODE_connect1_NODE_connect1_NODE: node_connect0_NODE_connect1_NODE_connect1_NODE, node_connect0_NODE_connect1_NODE: node_connect0_NODE_connect1_NODE } ) YIELD value as _
              RETURN COUNT(*)
            } \" , \"\" , { params: $params, node_connect0_NODE_connect1_NODE: node_connect0_NODE_connect1_NODE, node_connect0_NODE: node_connect0_NODE } ) YIELD value as _
            RETURN COUNT(*)
          } " , "" , { params: $params, node_connect0_NODE: node_connect0_NODE, node: node } ) YIELD value as _

        RETURN COUNT(*)
      }
    RETURN node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_connect0_NODE_where_id0_equal": "some-id1",
      "node_connect0_NODE_connect1_NODE_where_id0_equal": "some-id2",
      "node_connect0_NODE_connect1_NODE_connect1_NODE_where_id0_equal": "some-id3"
    }
}
```

---

### Nested `CREATE` from `CONNECT @edge` Node

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      CONNECT @edge(type: HAS_NODE, direction: IN) {
        NODE(label: Node) {
          CONNECT @edge(type: HAS_NODE, direction: OUT) {
            NODE(label: Node) {
              CREATE @edge(type: HAS_NODE, direction: OUT) {
                NODE(label: Node) {
                  SET {
                    id(value: "some-id1")
                  }
                }
                PROPERTIES {
                  SET {
                    id(value: "some-id2")
                  }
                }
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
  WITH node
  CALL {
    WITH node
    OPTIONAL MATCH (node_connect0_NODE:Node)
    CALL apoc.do.when(node_connect0_NODE IS NOT NULL, "
      MERGE (node)<-[:HAS_NODE]-(node_connect0_NODE)
      WITH node, node_connect0_NODE
      CALL {
        WITH node, node_connect0_NODE
        OPTIONAL MATCH (node_connect0_NODE_connect0_NODE:Node)
        CALL apoc.do.when(node_connect0_NODE_connect0_NODE IS NOT NULL, \"
          MERGE (node_connect0_NODE)-[:HAS_NODE]->(node_connect0_NODE_connect0_NODE)
          WITH node, node_connect0_NODE, node_connect0_NODE_connect0_NODE
          CALL {
            WITH node, node_connect0_NODE, node_connect0_NODE_connect0_NODE
            CREATE (node_connect0_NODE_connect0_NODE_create0_NODE:Node)
            SET node_connect0_NODE_connect0_NODE_create0_NODE.id = $params.node_connect0_NODE_connect0_NODE_create0_NODE_set_id
            RETURN node_connect0_NODE_connect0_NODE_create0_NODE
          }
          MERGE (node_connect0_NODE_connect0_NODE)-[node_connect0_NODE_connect0_NODE_create0_PROPERTIES:HAS_NODE]->(node_connect0_NODE_connect0_NODE_create0_NODE)
          SET node_connect0_NODE_connect0_NODE_create0_PROPERTIES.id = $params.node_connect0_NODE_connect0_NODE_create0_PROPERTIES_set_id \" , \"\" , { params: $params, node_connect0_NODE_connect0_NODE: node_connect0_NODE_connect0_NODE, node_connect0_NODE: node_connect0_NODE } ) YIELD value as _
          RETURN COUNT(*)
      } " , "" , { params: $params, node_connect0_NODE: node_connect0_NODE, node: node } ) YIELD value as _

      RETURN COUNT(*)
  }

  RETURN node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_connect0_NODE_connect0_NODE_create0_NODE_set_id": "some-id1",
      "node_connect0_NODE_connect0_NODE_create0_PROPERTIES_set_id": "some-id2"
    }
}
```

---

### `CONNECT @edge` Node with `SET` on `PROPERTIES`

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      CONNECT @edge(type: HAS_NODE, direction: IN) {
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
    WITH node
    OPTIONAL MATCH (node_connect0_NODE:Node)
    CALL apoc.do.when(node_connect0_NODE IS NOT NULL, " MERGE (node)<-[node_connect0_PROPERTIES:HAS_NODE]-(node_connect0_NODE) SET node_connect0_PROPERTIES.id = $params.node_connect0_PROPERTIES_set_id " , "" , { params: $params, node_connect0_NODE: node_connect0_NODE, node: node } ) YIELD value as _
    RETURN COUNT(*)
  }

  RETURN node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_connect0_PROPERTIES_set_id": "some-id"
    }
}
```

---
