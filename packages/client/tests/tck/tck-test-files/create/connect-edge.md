## `CREATE` & `CONNECT @edge`

---

### `CONNECT @edge` Node (without label or direction or type)

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      CONNECT @edge {
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

  OPTIONAL MATCH (node_connect0_NODE)
  FOREACH(_ IN CASE node_connect0_NODE WHEN NULL THEN [] ELSE [1] END |
      MERGE (node)-[]-(node_connect0_NODE)
  )

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

  OPTIONAL MATCH (node_connect0_NODE:Node)
  WHERE node_connect0_NODE.id = $params.node_connect0_NODE_where_id0_equal
  FOREACH(_ IN CASE node_connect0_NODE WHEN NULL THEN [] ELSE [1] END |
      MERGE (node)<-[:HAS_NODE]-(node_connect0_NODE)
  )

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

  OPTIONAL MATCH (node_connect0_NODE:Node)
  FOREACH(_ IN CASE node_connect0_NODE WHEN NULL THEN [] ELSE [1] END |
      MERGE (node)<-[node_connect0_PROPERTIES:HAS_NODE]-(node_connect0_NODE)
      SET node_connect0_PROPERTIES.id = $params.node_connect0_PROPERTIES_set_id
  )

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
