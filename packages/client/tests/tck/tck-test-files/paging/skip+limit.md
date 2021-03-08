## Skip + Limit

---

### Skip nodes

**Input GraphQL**

```graphql
{
    MATCH {
        node @node @paginate(skip: 1) {
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
    SKIP 1
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

### Skip nested nodes

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            RETURN {
                nestedNodes
                    @edge(type: HAS_NODE, direction: OUT)
                    @paginate(skip: 1) {
                    nestedNode @node {
                        RETURN {
                            id
                        }
                    }
                }
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    RETURN node {
        nestedNodes: [
            (node)-[:HAS_NODE]->(nestedNode) | {
                nestedNode: { id: nestedNode.id }
            }
        ][1..]
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

### Limit nodes

**Input GraphQL**

```graphql
{
    MATCH {
        node @node @paginate(limit: 1) {
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
    LIMIT 1
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

### Limit nested nodes

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            RETURN {
                nestedNodes
                    @edge(type: HAS_NODE, direction: OUT)
                    @paginate(limit: 1) {
                    nestedNode @node {
                        RETURN {
                            id
                        }
                    }
                }
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    RETURN node {
        nestedNodes: [
            (node)-[:HAS_NODE]->(nestedNode) | {
                nestedNode: { id: nestedNode.id }
            }
        ][..1]
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

### Skip + Limit nodes

**Input GraphQL**

```graphql
{
    MATCH {
        node @node @paginate(skip: 1, limit: 1) {
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
    SKIP 1
    LIMIT 1
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

### Skip + Limit nested nodes

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            RETURN {
                nestedNodes
                    @edge(type: HAS_NODE, direction: OUT)
                    @paginate(limit: 1, skip: 1) {
                    nestedNode @node {
                        RETURN {
                            id
                        }
                    }
                }
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    RETURN node {
        nestedNodes: [
            (node)-[:HAS_NODE]->(nestedNode) | {
                nestedNode: { id: nestedNode.id }
            }
        ][1..1]
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

### Skip + Limit + Sort nested nodes

**Input GraphQL**

```graphql
{
    MATCH {
        node @node {
            RETURN {
                nestedNodes
                    @edge(type: HAS_NODE, direction: OUT)
                    @paginate(limit: 1, skip: 1) {
                    nestedNode @node {
                        SORT {
                            id(direction: DESC)
                        }
                        RETURN {
                            id
                        }
                    }
                }
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    RETURN node {
        nestedNodes: apoc.coll.sortMulti([ (node)-[:HAS_NODE]->(nestedNode) | { nestedNode: { id: nestedNode.id } } ], ['id'])[1..1]
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
