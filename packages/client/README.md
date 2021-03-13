# @dgql/client

Translation engine and client for the [DGQL Language](https://github.com/danstarns/dgql).

## Getting Started

```
$ npm install @dgql/client
```

⚠ Library not yet published

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

    const { ussr } = await client.run({ query });

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
