## Conditional Selection

---

### `@include` v1

**Input GraphQL**

```graphql
{
  CREATE @include(if: true) {
    node @node
  }
}
```

**Output Cypher**

```cypher
CALL {
    CREATE (node)
    RETURN node
}

RETURN COUNT(*)
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### `@include` v2

**Input GraphQL**

```graphql
{
  MATCH {
    node @node @include(if: $ifIs)
  }
  RETURN {
    node
  }
}
```

**Input GraphQL Params**

```graphql-params
{
  "ifIs": true
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

### `@include` v3

**Input GraphQL**

```graphql
{
  MATCH {
    node @node
  }
  MATCH @include(if: $ifIs) {
    node2 @node
  }
  RETURN {
    node
    node2 @include(if: $ifIs)
  }
}
```

**Input GraphQL Params**

```graphql-params
{
  "ifIs": false
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

### `@skip` v1

**Input GraphQL**

```graphql
{
  CREATE @skip(if: false) {
    node @node
  }
}
```

**Output Cypher**

```cypher
CALL {
    CREATE (node)
    RETURN node
}

RETURN COUNT(*)
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### `@skip` v2

**Input GraphQL**

```graphql
{
  MATCH {
    node @node @skip(if: $ifIs)
  }
  RETURN {
    node
  }
}
```

**Input GraphQL Params**

```graphql-params
{
  "ifIs": false
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

### `@skip` v3

**Input GraphQL**

```graphql
{
  MATCH {
    node @node
  }
  MATCH @skip(if: $ifIs) {
    node2 @node
  }
  RETURN {
    node
    node2 @skip(if: $ifIs)
  }
}
```

**Input GraphQL Params**

```graphql-params
{
  "ifIs": true
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
