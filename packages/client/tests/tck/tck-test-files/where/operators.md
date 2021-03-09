## Where operators using Match

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
            RETURN {
                id
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    WHERE node.id = $params.node_where_id_equal
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id_equal": 1
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
            RETURN {
                id
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    WHERE NOT node.id = $params.node_where_id_not
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id_not": 1
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
            RETURN {
                id
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    WHERE node.id > $params.node_where_id_gt
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id_gt": 1
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
            RETURN {
                id
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    WHERE node.id >= $params.node_where_id_gte
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id_gte": 1
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
            RETURN {
                id
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    WHERE node.id < $params.node_where_id_lt
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id_lt": 1
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
            RETURN {
                id
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    WHERE node.id <= $params.node_where_id_lte
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id_lte": 1
    }
}
```

---

### starts_with

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                id(starts_with: 1)
            }
            RETURN {
                id
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    WHERE node.id STARTS WITH $params.node_where_id_starts_with
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id_starts_with": 1
    }
}
```

---

### end_with

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                id(ends_with: 1)
            }
            RETURN {
                id
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    WHERE node.id ENDS WITH $params.node_where_id_ends_with
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id_ends_with": 1
    }
}
```

---

### contains

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                id(contains: 1)
            }
            RETURN {
                id
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    WHERE node.id CONTAINS $params.node_where_id_contains
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id_contains": 1
    }
}
```

---

### regex

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                id(regex: ".*")
            }
            RETURN {
                id
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    WHERE node.id =~ $params.node_where_id_regex
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id_regex": ".*"
    }
}
```

---
