# DGQL/language/`DELETE`

## Intro

Use to delete nodes and their edges.

```graphql
{
  DELETE {
    NODE(label: User) {
      WHERE {

      }
    }
  }
}
```

## References

1. [TCK Tests Delete](https://github.com/danstarns/DGQL/tree/main/packages/language/tests/tck/tck-test-files/delete)
2. [WHERE](./where.md)

## Usage

Detach `DELETE`

```graphql
{
  DELETE {
    NODE @detach
  }
}
```

`DELETE` with [`WHERE`](./where.md)

```graphql
{
  DELETE {
    NODE {
      WHERE {
        id(equal: "123445678")
      }
    }
  }
}
```
