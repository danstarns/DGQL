## Sort

---

### Sort Node Properties DESC

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            SORT {
                id(direction: DESC)
            }
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
    WITH node
    ORDER BY node.id DESC
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

### Sort Node Properties ASC

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            SORT {
                id(direction: ASC)
            }
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
    WITH node
    ORDER BY node.id ASC
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

### Sort Node Properties DESC & ASC

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            SORT {
                id(direction: DESC)
                id(direction: ASC)
            }
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
    WITH node
    ORDER BY node.id DESC, node.id ASC
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

### Sort Nested Node Properties DESC

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            PROJECT {
                nestedNodes @edge(type: HAS_NODE, direction: OUT) {
                    nestedNode @node {
                        SORT {
                            id(direction: DESC)
                        }
                        PROJECT {
                            id
                        }
                    }
                }
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
    RETURN node {
        nestedNodes: apoc.coll.sortMulti([ (node)-[:HAS_NODE]->(nestedNode) | { nestedNode: { id: nestedNode.id } } ], ['id'])
    } AS node
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

### Sort Nested Node Properties ASC

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            PROJECT {
                nestedNodes @edge(type: HAS_NODE, direction: OUT) {
                    nestedNode @node {
                        SORT {
                            id(direction: ASC)
                        }
                        PROJECT {
                            id
                        }
                    }
                }
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
    RETURN node {
        nestedNodes: apoc.coll.sortMulti([ (node)-[:HAS_NODE]->(nestedNode) | { nestedNode: { id: nestedNode.id } } ], ['^id'])
    } AS node
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

### Sort Nested Node Properties DESC

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            PROJECT {
                nestedNodes @edge(type: HAS_NODE, direction: OUT) {
                    nestedNode @node {
                        SORT {
                            id(direction: DESC)
                        }
                        PROJECT {
                            id
                        }
                    }
                }
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
    RETURN node {
        nestedNodes: apoc.coll.sortMulti([ (node)-[:HAS_NODE]->(nestedNode) | { nestedNode: { id: nestedNode.id } } ], ['id'])
    } AS node
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

### Sort Nested Node Properties DESC & ASC

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            PROJECT {
                nestedNodes @edge(type: HAS_NODE, direction: OUT) {
                    nestedNode @node {
                        SORT {
                            id(direction: DESC)
                            id(direction: ASC)
                        }
                        PROJECT {
                            id
                        }
                    }
                }
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
    RETURN node {
        nestedNodes: apoc.coll.sortMulti([ (node)-[:HAS_NODE]->(nestedNode) | { nestedNode: { id: nestedNode.id } } ], ['id', '^id'])
    } AS node
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
