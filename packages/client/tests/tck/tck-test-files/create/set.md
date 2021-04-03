## `CREATE` & `SET`

---

### `CREATE` & `SET` property

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      SET {
        id(value: "some-random-id")
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
    SET node.id = $params.create_node_set_id
    RETURN node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "create_node_set_id": "some-random-id"
    }
}
```

---

### `CREATE` & `SET` many property

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      SET {
        id1(value: "some-random-id1")
        id2(value: "some-random-id2")
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
    SET node.id1 = $params.create_node_set_id1
    SET node.id2 = $params.create_node_set_id2
    RETURN node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "create_node_set_id1": "some-random-id1",
        "create_node_set_id2": "some-random-id2"
    }
}
```

---
