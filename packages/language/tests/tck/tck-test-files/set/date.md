## `SET` Date

---

### `CREATE` Node with `@datetime`

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      SET {
        time @datetime
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
  SET node.time = datetime()
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

### `CREATE` Node with `@datetime` with value

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      SET {
        time(value: "2019-06-01T18:40:32.142+0100") @datetime
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
  SET node.time = datetime($params.node_set_time)
  RETURN node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_set_time": "2019-06-01T18:40:32.142+0100"
    }
}
```

---

### `CREATE` Node with `@date`

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      SET {
        time @date
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
  SET node.time = date()
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

### `CREATE` Node with `@date` with value

**Input GraphQL**

```graphql
{
  CREATE {
    node @node {
      SET {
        time(value: "2019-06-01") @date
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
  SET node.time = date($params.node_set_time)
  RETURN node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
      "node_set_time": "2019-06-01"
    }
}
```

---
