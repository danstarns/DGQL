import * as neo4j from "neo4j-driver";
import * as dgql from "../../../packages/client/src";

const {
  NEO_URL = "bolt://localhost:7687",
  NEO_USER = "admin",
  NEO_PASSWORD = "password",
} = process.env;

export const driver = neo4j.driver(
  NEO_URL,
  neo4j.auth.basic(NEO_USER, NEO_PASSWORD)
);

export const client = new dgql.Client({
  driver,
});
