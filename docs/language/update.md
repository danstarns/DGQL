# DGQL/language/`UPDATE`

## Intro

Use to update nodes and their edges.

```graphql
{
  UPDATE {
    user @node(label: User) {
        WHERE {

        }
        UPDATE { # Nested Mutations

        }
        CONNECT { # Nested Mutations

        }
        DISCONNECT { # Nested Mutations

        }
        PROJECT {

        }
    }
  }
}
```

## Usage

### `UPDATE` & `WHERE` & `SET` & `PROJECT`

```graphql
{
  UPDATE {
    user @node(label: User) {
      WHERE {
        name(equal: "dan")
      }
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

### `UPDATE` many

```graphql
{
  UPDATE {
    node1 @node(label: Node) {
      WHERE {
        id(equal: "some-id1")
      }
      SET {
        updatedAt @datetime
      }
    }
    node2 @node(label: Node) {
      WHERE {
        id(equal: "some-id2")
      }
      SET {
        updatedAt @datetime
      }
    }
  }
  RETURN {
    node1
    node2
  }
}
```

### many `UPDATE`

```graphql
{
  UPDATE {
    node1 @node(label: Node) {
      WHERE {
        id(equal: "some-id1")
      }
      SET {
        updatedAt @datetime
      }
    }
  }
  UPDATE {
    node2 @node(label: Node) {
      WHERE {
        id(equal: "some-id2")
      }
      SET {
        updatedAt @datetime
      }
    }
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
  UPDATE {
    user @node(label: User) {
      WHERE {
        name(equal: "Dan")
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
  UPDATE {
    user @node(label: User) {
      WHERE {
        name(equal: "Dan")
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

### `UPDATE @edge`

```graphql
{
  UPDATE {
    user @node(label: User) {
      WHERE {
        name(equal: "Dan")
      }
      UPDATE @edge(type: HAS_POST, direction: OUT) {
        NODE(label: Post) {
          WHERE {
            content(equal: "Nested Mutations are cool!")
          }
          SET {
            content(value: "Nested Mutations are super cool!")
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

### `DISCONNECT @edge`

```graphql
{
  UPDATE {
    user @node(label: User) {
      WHERE {
        name(equal: "Dan")
      }
      DISCONNECT @edge(type: HAS_POST, direction: OUT) {
        NODE(label: Post) {
          WHERE {
            content(equal: "Nested Mutations are cool!")
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
