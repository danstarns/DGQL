## Comparison

---

### equal

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                id(equal: 1)
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
    WHERE node.id = $params.node_where_id0_equal
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_equal": 1
    }
}
```

---

### not

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                id(not: 1)
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
    WHERE NOT node.id = $params.node_where_id0_not
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_not": 1
    }
}
```

---

### gt

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                id(gt: 1)
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
    WHERE node.id > $params.node_where_id0_gt
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_gt": 1
    }
}
```

---

### gte

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                id(gte: 1)
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
    WHERE node.id >= $params.node_where_id0_gte
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_gte": 1
    }
}
```

---

### lt

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                id(lt: 1)
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
    WHERE node.id < $params.node_where_id0_lt
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_lt": 1
    }
}
```

---

### lte

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                id(lte: 1)
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
    WHERE node.id <= $params.node_where_id0_lte
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_lte": 1
    }
}
```

---
