# DGQL/language/Conditional Selection

## Intro

Use the `@skip` and `@limit` directives to conditionally apply fields to your selection.

### `@skip`

Used to skip a field based on a truthy value.

> 💡 You can use `@skip` on any field and on any operation

#### Usage

```graphql
{
  MATCH {
    node @node(label: User) {
      WHERE {
        name(equal: $name) @skip(if: $isAdmin)
      }
    }
  }
  RETURN {
    name
  }
}
```

### `@include`

Used to include a field based on a truthy value.

> 💡 You can use `@include` on any field and on any operation

#### Usage

```graphql
{
  MATCH {
    node @node(label: User) {
      WHERE {
        name(equal: $name) @include(if: $name)
      }
    }
  }
  RETURN {
    name
  }
}
```
