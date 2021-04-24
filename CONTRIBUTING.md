# Contributing

## Running Tests

> You need a neo4j instance unless you are using [docker compose](using-docker-compose)

1. Start a neo4j server
2. Run `$ cross-env NEO_USER=neo4j NEO_PASSWORD=test NEO_URL=neo4j://localhost:7687/neo4j npm run test`

#### Using docker compose

```
$ npm run test docker
```
