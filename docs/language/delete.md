# DGQL/language/`DELETE`

## Intro

Use to delete nodes and their edges.

```graphql
{
  DELETE {
    NODE(label: User)
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
