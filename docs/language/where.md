# DGQL/language/`WHERE`

## Intro

User to filter both node and relationship properties plus edges.

## References

1. [TCK Tests](https://github.com/danstarns/DGQL/tree/main/packages/language/tests/tck/tck-test-files/where/)

## Usage

### Simple `WHERE` directive

You can only use equality on where directive.

```graphql
{
  MATCH {
    user @node(label: User) @where(name: "Dan") {
      PROJECT {
        name
      }
    }
  }
}
```

### Simple `WHERE`

```graphql
{
  MATCH {
    user @node(label: User) {
      WHERE {
        name(equal: "Dan")
      }
      PROJECT {
        name
      }
    }
  }
}
```

### `WHERE` on node edge

```graphql
{
  MATCH {
    posts @node(label: Post) {
      WHERE {
        EDGE(type: HAS_POST, direction: IN) {
          NODE(label: User) {
            name(equal: "Dan")
          }
        }
      }
    }
  }
}
```

### `WHERE` on projection edge node

```graphql
{
  MATCH {
    user @node(label: User) {
      PROJECT {
        id
        posts @edge(type: HAS_POST, direction: OUT) {
          node @node(label: Post) {
            WHERE {
              content(equal: "Cool")
            }
            PROJECT {
              content
            }
          }
        }
      }
    }
  }
}
```

### `WHERE` on projection edge relationship

```graphql
{
  MATCH {
    user @node(label: User) {
      PROJECT {
        id
        posts @edge(type: HAS_POST, direction: OUT) {
          node @node(label: Post) {
            PROJECT {
              content
            }
          }
          PROPERTIES {
            WHERE {
              since(equal: "1999")
            }
          }
        }
      }
    }
  }
  RETURN {
    user
  }
}
```
