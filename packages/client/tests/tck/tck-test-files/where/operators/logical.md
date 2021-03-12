# Logical

---

### `AND`

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                AND {
                    WHERE {
                        id(equal: 1)
                    }
                    WHERE {
                        id(equal: 2)
                        AND {
                            WHERE {
                                id(equal: 3)
                            }
                        }
                    }
                }
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
    WHERE node.id = $params.node_where_AND0_id_equal AND node.id = $params.node_where_AND1_id_equal AND node.id = $params.node_where_AND1_AND0_id_equal
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_AND0_id_equal": 1,
        "node_where_AND1_id_equal": 2,
        "node_where_AND1_AND0_id_equal": 3
    }
}
```

---

### `OR`

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                OR {
                    WHERE {
                        id(equal: 1)
                    }
                    WHERE {
                        id(equal: 2)
                        OR {
                            WHERE {
                                id(equal: 3)
                            }
                        }
                    }
                }
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
    WHERE node.id = $params.node_where_OR0_id_equal OR node.id = $params.node_where_OR1_id_equal AND node.id = $params.node_where_OR1_OR0_id_equal
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_OR0_id_equal": 1,
        "node_where_OR1_id_equal": 2,
        "node_where_OR1_OR0_id_equal": 3
    }
}
```

---

### `XOR`

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            WHERE {
                XOR {
                    WHERE {
                        id(equal: 1)
                    }
                    WHERE {
                        id(equal: 2)
                        XOR {
                            WHERE {
                                id(equal: 3)
                            }
                        }
                    }
                }
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
    WHERE node.id = $params.node_where_XOR0_id_equal XOR node.id = $params.node_where_XOR1_id_equal AND node.id = $params.node_where_XOR1_XOR0_id_equal
    RETURN node { id: node.id } AS node
}

RETURN node
```

**Output Cypher params**

```params
{
    "params": {
        "node_where_XOR0_id_equal": 1,
        "node_where_XOR1_id_equal": 2,
        "node_where_XOR1_XOR0_id_equal": 3
    }
}
```

---
