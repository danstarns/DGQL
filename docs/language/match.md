# DGQL/language/`MATCH`

## Intro

Use in correlation with cyphers `MATCH` statement. The most Basic of `MATCH` is;

```graphql
{
  MATCH {
    user @node(label: User)
  }
}
```

> Matching a node and not returning is pretty pointless so checkout [`RETURN`](./return.md).

Given the most basic example, above, your just matching and holding a reference to the `raw` node object from the Neo4j Javascript Driver. You can however, [`PROJECT`](./project.md) values out of the node, easy for application use.

## Usage

### Optional

```graphql
{
  MATCH {
    user @node(label: User) @optional
  }
}
```

### `MATCH` & `PROJECT` & `RETURN`

> [`PROJECT`](./project.md) & [`RETURN`](./return.md)

```graphql
{
  MATCH {
    users @node(label: User) {
      PROJECT {
        name
      }
    }
  }
  RETURN {
    users
  }
}
```

### `MATCH` many nodes

```graphql
{
  MATCH {
    users @node(label: User)
    posts @node(label: Post)
  }
}
```

### Many `MATCH`

```graphql
{
  MATCH {
    users @node(label: User)
  }
  MATCH {
    posts @node(label: Post)
  }
}
```
