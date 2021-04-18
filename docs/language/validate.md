# DGQL/language/`@validate`

## Intro

Used to enforce properties when using [`SET`](./set.md)

## Usage

### String

```graphql
{
  SET {
    name(value: $name)
      @validate(
        type: String
        minLength: 5 # Optional
        maxLength: 300 # Optional
        regex: "user-.*" # Optional (Javascript Style)
        error: "Invalid Name" # Optional
      )
  }
}
```

### Number

```graphql
{
  SET {
    born(value: $born)
      @validate(
        type: Number
        min: 1910 # Optional
        max: 2021 # Optional
        error: "Invalid Year" # Optional
      )
  }
}
```

### Boolean

```graphql
{
  SET {
    isActive(value: $isActive)
      @validate(
        type: Boolean
        error: "Is Active Must Be A Boolean" # Optional
      )
  }
}
```

### required

```graphql
{
  SET {
    born(value: $born)
      @validate(
        required: true
        error: "Born Required" # Optional
      )
  }
}
```

### Stacking

You can stack the validate directives and to achieve an `AND` operation on each rule.

### Number

```graphql
{
  SET {
    born(value: $born)
      @validate(
        type: Number
        min: 1910 # Optional
        error: "Year Must be Grater Than 1910" # Optional
      )
      @validate(
        type: Number
        max: 2022 # Optional
        error: "Year Must be Less Than 2022" # Optional
      )
  }
}
```
