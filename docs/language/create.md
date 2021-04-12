# DGQL/language/`CREATE`

## Intro

Use in correlation with cyphers `CREATE` statement.

```graphql
{
  CREATE {
    user @node(label: User) @where() {
        SET {

        }
        UPDATE {

        }
        CONNECT { # Nested Mutations

        }
        CREATE { # nested Mutations

        }
        PROJECT {

        }
    }
  }
}
```

Given the most basic example, above, your just create and then holding a reference to the "raw" node. You also [`PROJECT`](./project.md) values out of the node, easy for application use.

## Usage

### `CREATE` & `SET` & `PROJECT`

```graphql
{
  CREATE {
    user @node(label: User) {
      SET {
        name(value: "Dan")
      }
      PROJECT {
        id
      }
    }
  }
  RETURN {
    user
  }
}
```

### `CREATE` many

```graphql
{
  CREATE {
    node1 @node(label: Node)
    node2 @node(label: Node)
  }
  RETURN {
    node1
    node2
  }
}
```

### many `CREATE`

```graphql
{
  CREATE {
    node1 @node(label: Node)
  }
  CREATE {
    node2 @node(label: Node)
  }
  RETURN {
    node1
    node2
  }
}
```

### `CREATE @edge`

```graphql
{
  CREATE {
    user @node(label: User) {
      SET {
        name(value: "Dan")
      }
      CREATE @edge(type: HAS_POST, direction: OUT) {
        NODE(label: Post) {
          SET {
            content(value: "Nested Mutations are cool!")
          }
        }
        PROPERTIES {
          SET {
            since(value: "04/04/2021")
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

### `CONNECT @edge`

```graphql
{
  CREATE {
    user @node(label: User) {
      SET {
        name(value: "Dan")
      }
      CONNECT @edge(type: HAS_POST, direction: OUT) {
        NODE(label: Post) {
          WHERE {
            content(equal: "Nested Mutations are cool!")
          }
        }
        PROPERTIES {
          SET {
            since(value: "04/04/2021")
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
