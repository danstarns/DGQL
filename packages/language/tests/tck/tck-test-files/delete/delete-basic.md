## Basic Delete

---

### Delete Node

**Input GraphQL**

```graphql
{
  DELETE {
    NODE
  }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (delete0_NODE0)
    DELETE delete0_NODE0
    RETURN COUNT(*)
}
RETURN COUNT(*)
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Delete Node With `@detach`

**Input GraphQL**

```graphql
{
  DELETE {
    NODE @detach
  }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (delete0_NODE0)
    DETACH DELETE delete0_NODE0
    RETURN COUNT(*)
}
RETURN COUNT(*)
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Delete Node With `WHERE`

**Input GraphQL**

```graphql
{
  DELETE {
    NODE {
      WHERE {
        id(equal: "123")
      }
    }
  }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (delete0_NODE0)
    WHERE delete0_NODE0.id = $params.delete0_NODE0_where_id0_equal
    DELETE delete0_NODE0
    RETURN COUNT(*)
}
RETURN COUNT(*)
```

**Output Cypher params**

```params
{
    "params": {
        "delete0_NODE0_where_id0_equal": "123"
    }
}
```

---
