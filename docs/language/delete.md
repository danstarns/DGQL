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
