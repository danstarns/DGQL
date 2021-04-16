## `UPDATE` an `@edge`

---

### `UPDATE CREATE @edge` Node (without direction or type)

**Input GraphQL**

```graphql
{
  UPDATE {
    node @node {
      CREATE @edge(type: HAS_NODE) {
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
  OPTIONAL MATCH (node)
  CALL apoc.do.when(node IS NOT NULL, "
    WITH node
    CALL {
      CREATE (node_create0_NODE)
      RETURN node_create0_NODE
    }
    MERGE (node)-[:HAS_NODE]-(node_create0_NODE)
    RETURN node " , "" , { params: $params, node: node } ) YIELD value AS _
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
  UPDATE {
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
  OPTIONAL MATCH (node)
  CALL apoc.do.when(node IS NOT NULL, "
    WITH node
    CALL {
      CREATE (node_create0_NODE:Node)
      RETURN node_create0_NODE
    }
    MERGE (node)-[:HAS_EDGE]->(node_create0_NODE)
    RETURN node " , "" , { params: $params, node: node } ) YIELD value AS _
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
  UPDATE {
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
  OPTIONAL MATCH (node)
  CALL apoc.do.when(node IS NOT NULL, "
    SET node.id = $params.node_set_id
    WITH node
    CALL {
      CREATE (node_create1_NODE:Node)
      SET node_create1_NODE.id = $params.node_create1_NODE_set_id
      RETURN node_create1_NODE
    }
    MERGE (node)-[:HAS_EDGE]->(node_create1_NODE)
    RETURN node " , "" , { params: $params, node: node } ) YIELD value AS _
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
  UPDATE {
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
  OPTIONAL MATCH (node)
  CALL apoc.do.when(node IS NOT NULL, "
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
  RETURN node " , "" , { params: $params, node: node } ) YIELD value AS _
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
  UPDATE {
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
  OPTIONAL MATCH (node)
  CALL apoc.do.when(node IS NOT NULL, "
    WITH node
    CALL {
      CREATE (node_create0_NODE:Node)
      RETURN node_create0_NODE
    }
    MERGE (node)-[node_create0_PROPERTIES:HAS_EDGE]->(node_create0_NODE)
    SET node_create0_PROPERTIES.id = $params.node_create0_PROPERTIES_set_id RETURN node " , "" , { params: $params, node: node } ) YIELD value AS _
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

### `UPDATE CONNECT @edge` Node (without direction or type)

**Input GraphQL**

```graphql
{
  UPDATE {
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
  OPTIONAL MATCH (node) 
  CALL apoc.do.when(node IS NOT NULL, " 
    WITH node 
    CALL { 
      WITH node 
      OPTIONAL MATCH (node_connect0_NODE) 
      CALL apoc.do.when(node_connect0_NODE IS NOT NULL, \" 
        MERGE (node)-[:HAS_NODE]-(node_connect0_NODE) 
        \" , \"\" , { params: $params, node_connect0_NODE: node_connect0_NODE, node: node } ) YIELD value as _ 
      RETURN COUNT(*) 
    } 

    RETURN node
  " , "" , { params: $params, node: node } ) YIELD value AS _ 
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

### `UPDATE CONNECT @edge` Node (without direction or type) (3 level)

**Input GraphQL**

```graphql
{
  UPDATE {
    node @node(label: Node) {
      CONNECT @edge(type: HAS_NODE) {
        NODE(label: Node) {
          CONNECT @edge(type: HAS_NODE) {
            NODE(label: Node) {
              CONNECT @edge(type: HAS_NODE) {
                NODE(label: Node)
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
  OPTIONAL MATCH (node:Node) 
  CALL apoc.do.when(node IS NOT NULL, " 
    WITH node 
    CALL { 
      WITH node 
      OPTIONAL MATCH (node_connect0_NODE:Node) 
      CALL apoc.do.when(node_connect0_NODE IS NOT NULL, \" 
        MERGE (node)-[:HAS_NODE]-(node_connect0_NODE)
        WITH node, node_connect0_NODE 
        CALL { 
          WITH node, node_connect0_NODE 
          OPTIONAL MATCH (node_connect0_NODE_connect0_NODE:Node) 
          CALL apoc.do.when(node_connect0_NODE_connect0_NODE IS NOT NULL, \" 
            MERGE (node_connect0_NODE)-[:HAS_NODE]-(node_connect0_NODE_connect0_NODE)
            WITH node, node_connect0_NODE, node_connect0_NODE_connect0_NODE 
            CALL { 
              WITH node, node_connect0_NODE, node_connect0_NODE_connect0_NODE 
              OPTIONAL MATCH (node_connect0_NODE_connect0_NODE_connect0_NODE:Node) 
              CALL apoc.do.when(node_connect0_NODE_connect0_NODE_connect0_NODE IS NOT NULL, \" MERGE (node_connect0_NODE_connect0_NODE)-[:HAS_NODE]-(node_connect0_NODE_connect0_NODE_connect0_NODE) \" , \"\" , { params: $params, node_connect0_NODE_connect0_NODE_connect0_NODE: node_connect0_NODE_connect0_NODE_connect0_NODE, node_connect0_NODE_connect0_NODE: node_connect0_NODE_connect0_NODE } ) YIELD value as _ 
              RETURN COUNT(*) 
            }
          \" , \"\" , { params: $params, node_connect0_NODE_connect0_NODE: node_connect0_NODE_connect0_NODE, node_connect0_NODE: node_connect0_NODE } ) YIELD value as _ 
          RETURN COUNT(*) 
        } 
        \" , \"\" , { params: $params, node_connect0_NODE: node_connect0_NODE, node: node } ) YIELD value as _ 
      RETURN COUNT(*) 
    } 

    RETURN node
  " , "" , { params: $params, node: node } ) YIELD value AS _ 
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


### `UPDATE UPDATE @edge` Node

**Input GraphQL**

```graphql
{
  UPDATE {
    node @node {
      UPDATE @edge(type: HAS_NODE) {
        NODE {
          SET {
            id(value: "test")
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
  OPTIONAL MATCH (node)
  CALL apoc.do.when(node IS NOT NULL, "
    CALL {
      WITH node
      OPTIONAL MATCH (node)-[:HAS_NODE]-(node_update_0_NODE)
      CALL apoc.do.when(node_update_0_NODE IS NOT NULL, \"
        SET node_update_0_NODE.id = $params.node_update_0_NODE_set_id
        RETURN COUNT(*)
      \" , \"\" , { params: $params, node_update_0_NODE: node_update_0_NODE } ) YIELD value AS _

      RETURN COUNT(*)
    }
    RETURN node
  " , "" , { params: $params, node: node } ) YIELD value AS _

  RETURN node
}
RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_update_0_NODE_set_id": "test"
    }
}
```

---

### `UPDATE UPDATE @edge` Node With `WHERE`

**Input GraphQL**

```graphql
{
  UPDATE {
    node @node {
      UPDATE @edge(type: HAS_NODE) {
        NODE {
          WHERE {
            id(equal: "TEST")
          }
          SET {
            id(value: "test")
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
  OPTIONAL MATCH (node)
  CALL apoc.do.when(node IS NOT NULL, "
    CALL {
      WITH node
      OPTIONAL MATCH (node)-[:HAS_NODE]-(node_update_0_NODE)
      WHERE node_update_0_NODE.id = $params.node_update_0_NODE_where_id0_equal
      CALL apoc.do.when(node_update_0_NODE IS NOT NULL, \"
        SET node_update_0_NODE.id = $params.node_update_0_NODE_set_id
        RETURN COUNT(*)
      \" , \"\" , { params: $params, node_update_0_NODE: node_update_0_NODE } ) YIELD value AS _

      RETURN COUNT(*)
    }
    RETURN node
  " , "" , { params: $params, node: node } ) YIELD value AS _

  RETURN node
}
RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_update_0_NODE_set_id": "test",
      "node_update_0_NODE_where_id0_equal": "TEST"
    }
}
```

---

### `UPDATE UPDATE @edge` `PROPERTIES`

**Input GraphQL**

```graphql
{
  UPDATE {
    node @node {
      UPDATE @edge(type: HAS_NODE) {
        PROPERTIES {
          SET {
            id(value: "test")
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
  OPTIONAL MATCH (node)
  CALL apoc.do.when(node IS NOT NULL, "
    CALL {
      WITH node
      OPTIONAL MATCH (node)-[node_REL:HAS_NODE]-(node_update_0_NODE)
      CALL apoc.do.when(node_update_0_NODE IS NOT NULL, \"
        SET node_REL.id = $params.node_REL_set_id
        RETURN COUNT(*)
      \" , \"\" , { params: $params, node_update_0_NODE: node_update_0_NODE, node_REL: node_REL } ) YIELD value AS _

      RETURN COUNT(*)
    }
    RETURN node
  " , "" , { params: $params, node: node } ) YIELD value AS _

  RETURN node
}
RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_REL_set_id": "test"
    }
}
```

---

### `UPDATE UPDATE @edge` `PROPERTIES` With `WHERE`

**Input GraphQL**

```graphql
{
  UPDATE {
    node @node {
      UPDATE @edge(type: HAS_NODE) {
        PROPERTIES {
          WHERE {
            id(equal: "TEST")
          }
          SET {
            id(value: "test")
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
  OPTIONAL MATCH (node)
  CALL apoc.do.when(node IS NOT NULL, "
    CALL {
      WITH node
      OPTIONAL MATCH (node)-[node_REL:HAS_NODE]-(node_update_0_NODE)
      WHERE node_REL.id = $params.node_REL_where_id0_equal
      CALL apoc.do.when(node_update_0_NODE IS NOT NULL, \"
        SET node_REL.id = $params.node_REL_set_id
        RETURN COUNT(*)
      \" , \"\" , { params: $params, node_update_0_NODE: node_update_0_NODE, node_REL: node_REL } ) YIELD value AS _

      RETURN COUNT(*)
    }
    RETURN node
  " , "" , { params: $params, node: node } ) YIELD value AS _

  RETURN node
}
RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_REL_set_id": "test",
      "node_REL_where_id0_equal": "TEST"
    }
}
```

---
