## Where edge

---

### Simple where on edge node

**Input GraphQL**

```graphql
{
    MATCH {
        nodes @node {
            WHERE {
                EDGE(type: HAS_NODE, direction: OUT) {
                    NODE {
                        id(equal: 1)
                    }
                }
            }
        }
    }
    RETURN {
        nodes
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (nodes)
    WHERE EXISTS((nodes)-[:HAS_NODE]->()) AND ALL(nodes_where_EDGE0_node IN [(nodes)-[:HAS_NODE]->(nodes_where_EDGE0_node) | nodes_where_EDGE0_node] WHERE nodes_where_EDGE0_node.id = $params.nodes_where_EDGE0_node_id0_equal)
    RETURN nodes
}

RETURN nodes
```

**Output Cypher params**

```params
{
    "params": {
        "nodes_where_EDGE0_node_id0_equal": 1
    }
}
```

---

### Nested where on edge nodes

**Input GraphQL**

```graphql
{
    MATCH {
        nodes @node {
            WHERE {
                EDGE(type: HAS_NODE, direction: OUT) {
                    NODE {
                        EDGE(type: HAS_NODE, direction: OUT) {
                            NODE {
                                id(equal: 1)
                            }
                        }
                    }
                }
            }
        }
    }
    RETURN {
        nodes
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (nodes)
    WHERE EXISTS((nodes)-[:HAS_NODE]->())
    AND ALL(nodes_where_EDGE0_node IN [(nodes)-[:HAS_NODE]->(nodes_where_EDGE0_node) | nodes_where_EDGE0_node] WHERE EXISTS((nodes_where_EDGE0_node)-[:HAS_NODE]->()) AND ALL(nodes_where_EDGE0_node_EDGE0_node IN [(nodes_where_EDGE0_node)-[:HAS_NODE]->(nodes_where_EDGE0_node_EDGE0_node) | nodes_where_EDGE0_node_EDGE0_node] WHERE nodes_where_EDGE0_node_EDGE0_node.id = $params.nodes_where_EDGE0_node_EDGE0_node_id0_equal))
    RETURN nodes
}

RETURN nodes
```

**Output Cypher params**

```params
{
    "params": {
        "nodes_where_EDGE0_node_EDGE0_node_id0_equal": 1
    }
}
```

---

### Simple where on edge node (with labels)

**Input GraphQL**

```graphql
{
    MATCH {
        posts @node(label: Post) {
            WHERE {
                EDGE(type: WROTE, direction: IN) {
                    NODE(label: User) {
                        email(equal: "admin@admin.com")
                    }
                }
            }
        }
    }
    RETURN {
        posts
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (posts:Post)
    WHERE
    EXISTS((posts)<-[:WROTE]-(:User))
    AND
    ALL(posts_where_EDGE0_node IN [(posts)<-[:WROTE]-(posts_where_EDGE0_node:User) | posts_where_EDGE0_node] WHERE posts_where_EDGE0_node.email = $params.posts_where_EDGE0_node_email0_equal)
    RETURN posts
}

RETURN posts
```

**Output Cypher params**

```params
{
    "params": {
        "posts_where_EDGE0_node_email0_equal": "admin@admin.com"
    }
}
```

---

### Simple where on edge node (with @all)

> @all is default

**Input GraphQL**

```graphql
{
    MATCH {
        nodes @node {
            WHERE {
                EDGE(type: HAS_NODE, direction: OUT) @all {
                    NODE {
                        id(equal: 1)
                    }
                }
            }
        }
    }
    RETURN {
        nodes
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (nodes)
    WHERE EXISTS((nodes)-[:HAS_NODE]->()) AND ALL(nodes_where_EDGE0_node IN [(nodes)-[:HAS_NODE]->(nodes_where_EDGE0_node) | nodes_where_EDGE0_node] WHERE nodes_where_EDGE0_node.id = $params.nodes_where_EDGE0_node_id0_equal)
    RETURN nodes
}

RETURN nodes
```

**Output Cypher params**

```params
{
    "params": {
        "nodes_where_EDGE0_node_id0_equal": 1
    }
}
```

---

### Simple where on edge node (with @any)

**Input GraphQL**

```graphql
{
    MATCH {
        nodes @node {
            WHERE {
                EDGE(type: HAS_NODE, direction: OUT) @any {
                    NODE {
                        id(equal: 1)
                    }
                }
            }
        }
    }
    RETURN {
        nodes
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (nodes)
    WHERE EXISTS((nodes)-[:HAS_NODE]->())
    AND ANY(nodes_where_EDGE0_node IN [(nodes)-[:HAS_NODE]->(nodes_where_EDGE0_node) | nodes_where_EDGE0_node] WHERE nodes_where_EDGE0_node.id = $params.nodes_where_EDGE0_node_id0_equal)
    RETURN nodes
}

RETURN nodes
```

**Output Cypher params**

```params
{
    "params": {
        "nodes_where_EDGE0_node_id0_equal": 1
    }
}
```

---

### Simple where on edge node (with @single)

**Input GraphQL**

```graphql
{
    MATCH {
        nodes @node {
            WHERE {
                EDGE(type: HAS_NODE, direction: OUT) @single {
                    NODE {
                        id(equal: 1)
                    }
                }
            }
        }
    }
    RETURN {
        nodes
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (nodes)
    WHERE EXISTS((nodes)-[:HAS_NODE]->())
    AND SINGLE(nodes_where_EDGE0_node IN [(nodes)-[:HAS_NODE]->(nodes_where_EDGE0_node) | nodes_where_EDGE0_node] WHERE nodes_where_EDGE0_node.id = $params.nodes_where_EDGE0_node_id0_equal)
    RETURN nodes
}

RETURN nodes
```

**Output Cypher params**

```params
{
    "params": {
        "nodes_where_EDGE0_node_id0_equal": 1
    }
}
```

---

### Simple where on edge node (with @none)

**Input GraphQL**

```graphql
{
    MATCH {
        nodes @node {
            WHERE {
                EDGE(type: HAS_NODE, direction: OUT) @none {
                    NODE {
                        id(equal: 1)
                    }
                }
            }
        }
    }
    RETURN {
        nodes
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (nodes)
    WHERE EXISTS((nodes)-[:HAS_NODE]->()) AND NONE(nodes_where_EDGE0_node IN [(nodes)-[:HAS_NODE]->(nodes_where_EDGE0_node) | nodes_where_EDGE0_node] WHERE nodes_where_EDGE0_node.id = $params.nodes_where_EDGE0_node_id0_equal)
    RETURN nodes
}

RETURN nodes
```

**Output Cypher params**

```params
{
    "params": {
        "nodes_where_EDGE0_node_id0_equal": 1
    }
}
```

---

### Simple where on edge node (with @exists)

**Input GraphQL**

```graphql
{
    MATCH {
        nodes @node {
            WHERE {
                EDGE(type: HAS_NODE, direction: OUT) @exists
            }
        }
    }
    RETURN {
        nodes
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (nodes)
    WHERE EXISTS((nodes)-[:HAS_NODE]->())
    RETURN nodes
}

RETURN nodes
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Simple where on edge node (with @exists and @node)

**Input GraphQL**

```graphql
{
    MATCH {
        nodes @node {
            WHERE {
                EDGE(type: HAS_NODE, direction: OUT) @exists @node(label: Node)
            }
        }
    }
    RETURN {
        nodes
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (nodes)
    WHERE EXISTS((nodes)-[:HAS_NODE]->(:Node))
    RETURN nodes
}

RETURN nodes
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---
