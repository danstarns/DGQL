## Basic Match

---

### Match Node

**Input GraphQL**

```graphql
{
    MATCH {
        node {
            RETURN {
                name
            }
        }
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

### Match Node with label

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                name
            }
        }
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
