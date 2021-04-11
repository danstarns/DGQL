## String

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
    WHERE node.id STARTS WITH $params.node_where_id0_starts_with
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_starts_with": 1
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
    WHERE node.id ENDS WITH $params.node_where_id0_ends_with
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_ends_with": 1
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
    WHERE node.id CONTAINS $params.node_where_id0_contains
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_contains": 1
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
    WHERE node.id =~ $params.node_where_id0_regex
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_id0_regex": ".*"
    }
}
```

---
