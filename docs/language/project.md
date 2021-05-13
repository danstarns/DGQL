# DGQL/language/`PROJECT`

## Intro

Use to select properties on a matched node or relationship

Take the big 'node object', returned from Neo4j Javascript Driver, and `PROJECT` it into a usable, JSON like, structure - Perfect for application use.

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

## References

1. [TCK Tests Match Project](https://github.com/danstarns/DGQL/tree/main/packages/language/tests/tck/tck-test-files/match/match-project.md)
2. [TCK Tests Create Project](https://github.com/danstarns/DGQL/tree/main/packages/language/tests/tck/tck-test-files/create/create-project.md)
3. [TCK Tests Update Project](https://github.com/danstarns/DGQL/tree/main/packages/language/tests/tck/tck-test-files/update/update-project.md)

## Usage

### `MATCH` and `PROJECT` edge node

```graphql
{
  MATCH {
    user @node(label: User) {
      PROJECT {
        name
        posts @edge(type: HAS_POST, direction: OUT) @node(label: Post) {
          title
        }
      }
    }
  }
}
```

### `MATCH` and `PROJECT` many nodes on an edge

```graphql
{
  MATCH {
    user @node(label: User) {
      PROJECT {
        name
        content @edge(type: HAS_CONTENT, direction: OUT) {
          photo @node(label: Photo) {
            PROJECT {
              size
              type
              base64
            }
          }
          video @node(label: Video) {
            PROJECT {
              thumbnail
              length
              url
            }
          }
          post @node(label: Post) {
            PROJECT {
              title
              content
            }
          }
        }
      }
    }
  }
}
```

### `MATCH` and `PROJECT` edge properties

```graphql
{
  MATCH {
    user @node(label: User) {
      PROJECT {
        name
        posts @edge(type: HAS_POST, direction: OUT) {
          post @node(label: Post)
          PROPERTIES {
            PROJECT {
              since
            }
          }
        }
      }
    }
  }
}
```
