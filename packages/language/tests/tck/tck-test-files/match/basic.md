## Basic Match

---

### Match Node

**Input GraphQL**

```graphql
{
  MATCH {
    node @node {
      PROJECT {
        name
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
    RETURN node { name: node.name } AS node
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

### Match Node With No Fields

**Input GraphQL**

```graphql
{
  MATCH {
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
    MATCH (node)
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

### Match Node with label

**Input GraphQL**

```graphql
{
  MATCH {
    user @node(label: User) {
      PROJECT {
        name
      }
    }
  }
  RETURN {
    user
  }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    RETURN user { name: user.name } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Match Node with `@optional`

**Input GraphQL**

```graphql
{
  MATCH {
    user @node(label: User) @optional {
      PROJECT {
        name
      }
    }
  }
  RETURN {
    user
  }
}
```

**Output Cypher**

```cypher
CALL {
    OPTIONAL MATCH (user:User)
    RETURN user { name: user.name } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---
