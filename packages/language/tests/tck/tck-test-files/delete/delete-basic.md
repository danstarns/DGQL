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
    MATCH (NODE)
    DELETE NODE
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
    MATCH (NODE)
    DETACH DELETE NODE
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
