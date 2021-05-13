# DGQL/language/`SET`

## Intro

Setting values on either nodes or relationship properties

## References

1. [TCK Tests Set](https://github.com/danstarns/DGQL/tree/main/packages/language/tests/tck/tck-test-files/set)

## Usage

### `SET` Value

```graphql
{
  SET {
    name(value: "Dan")
  }
}
```

### `SET` Date

See [DateTime TCK](https://github.com/danstarns/DGQL/blob/main/packages/language/tests/tck/tck-test-files/set/date.md)

### `SET` UUID

See [UUID TCK](https://github.com/danstarns/DGQL/blob/main/packages/language/tests/tck/tck-test-files/set/uuid.md)

### `@validate`

Validate properties.

See [`@validate`](./validate.md)
