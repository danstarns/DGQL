# DGQL/language/`MATCH`

## Intro

Use in correlation with cyphers `MATCH` statement. The most Basic of `MATCH` is:

```graphql
{
  MATCH {
    user @node(label: User)
  }
}
```

## References

1. [RETURN](./return.md)
2. [PROJECT](./project.md)
3. [TCK Tests Match](https://github.com/danstarns/DGQL/tree/main/packages/language/tests/tck/tck-test-files/match/)
4. [WHERE](./where.md)

## Usage

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

### `@optional`

```graphql
{
  MATCH {
    user @node(label: User) @optional
  }
}
```
