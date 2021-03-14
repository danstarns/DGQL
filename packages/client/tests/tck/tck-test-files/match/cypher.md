## Basic Match

---

### Top level cypher primitive

**Input GraphQL**

```graphql
{
    MATCH {
        number @cypher(arguments: { number: 1 }, statement: "RETURN $number")
    }
    RETURN {
        number
    }
}
```

**Output Cypher**

```cypher
CALL {
    RETURN apoc.cypher.runFirstColumnSingle("RETURN $number", { number: $params.number_cypher_arguments_number }) AS number
}

RETURN number
```

**Output Cypher params**

```params
{
    "params": {
        "number_cypher_arguments_number": 1
    }
}
```

---

### Top level cypher object

**Input GraphQL**

```graphql
{
    MATCH {
        nodes @cypher(statement: "MATCH (n) RETURN n") {
            id
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
    RETURN head([nodes IN apoc.cypher.runFirstColumn("MATCH (n) RETURN n", {}, true) | nodes { id: nodes.id }]) AS nodes
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

### Field level cypher primitive

**Input GraphQL**

```graphql
{
    MATCH {
        nodes @node {
            PROJECT {
                number
                    @cypher(
                        arguments: { number: 1 }
                        statement: """
                        RETURN $number
                        """
                    )
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
    RETURN nodes {
        number: apoc.cypher.runFirstColumnSingle("RETURN $number", { number: $params.nodes_number_cypher_arguments_number, this: nodes })
    } AS nodes
}

RETURN nodes
```

**Output Cypher params**

```params
{
    "params": {
        "nodes_number_cypher_arguments_number": 1
    }
}
```

---

### Field level cypher object

**Input GraphQL**

```graphql
{
    MATCH {
        nodes @node {
            PROJECT {
                nodes @cypher(statement: "MATCH (n) RETURN n") {
                    id
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
    RETURN nodes {
        nodes: [nodes_nodes IN apoc.cypher.runFirstColumn("MATCH (n) RETURN n", { this: nodes }, true) | nodes_nodes { id: nodes_nodes.id }]
    } AS nodes
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
