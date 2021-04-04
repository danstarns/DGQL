## `CREATE`

---

### Create Node

**Input GraphQL**

```graphql
{
  CREATE {
    node @node
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

### Create Many Node

**Input GraphQL**

```graphql
{
  CREATE {
    node1 @node
    node2 @node
  }
  RETURN {
    node1
    node2
  }
}
```

**Output Cypher**

```cypher
CALL {
    CREATE (node1)
    RETURN node1
}

CALL {
    CREATE (node2)
    RETURN node2
}

RETURN node1, node2
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Many Create Node

**Input GraphQL**

```graphql
{
  CREATE {
    node1 @node
  }
  CREATE {
    node2 @node
  }
  RETURN {
    node1
    node2
  }
}
```

**Output Cypher**

```cypher
CALL {
    CREATE (node1)
    RETURN node1
}

CALL {
    CREATE (node2)
    RETURN node2
}

RETURN node1, node2
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---
