## Null

---

### exists (true)

**Input GraphQL**

```graphql
{
  MATCH {
    node @node {
      WHERE {
        id(exists: true)
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
    WHERE node.id IS NOT NULL
    RETURN node { id: node.id } AS node
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

### exists (false)

**Input GraphQL**

```graphql
{
  MATCH {
    node @node {
      WHERE {
        id(exists: false)
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
    WHERE node.id IS NULL
    RETURN node { id: node.id } AS node
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
