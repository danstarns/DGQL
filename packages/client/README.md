# @dgql/client

<a href="https://badge.fury.io/js/%40dgql%2Fclient">
  <img alt="npm package" src="https://badge.fury.io/js/%40dgql%2Fclient.svg">
</a>

Translation engine and client for the [DGQL Language](https://github.com/danstarns/dgql).

## Getting Started

```
$ npm install @dgql/client
```

## Quick Start

```js
const { Client } = require("@dgql/client");
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic("neo4j", "password")
);

const client = new Client({ driver });

async function main() {
  const query = `
        {
            MATCH {
                user @node(label: User) {
                    WHERE {
                        name(equal: "Dan")
                    }
                    PROJECT {
                        name
                        posts @edge(type: HAS_POST, direction: OUT) @node(label: Post) {
                            title
                        }
                    }
                }
            }
            RETURN {
                user
            }
        }
    `;

  const { user } = await client.run({ query });

  console.log(user);
  /*
        [{
            name: "Dan",
            posts: [
                {
                    title: "Checkout @dgql/client"
                }
            ]
        }]
    */
}

main();
```

## Usage

### Variables

Use the `$` symbol to use variables and provide `variables` map when calling `translation` or `run`;

```js
const { user } = await client.run({ query, variables: { id: "user-id" } }); // OR
const translation = client.translate({ query, variables: { id: "user-id" } }); // OR
```

```graphql
{
  MATCH {
    user @node(label: User) {
      WHERE {
        id(equal: $id)
      }
    }
  }
  RETURN {
    user
  }
}
```
