import * as neo4j from "neo4j-driver";
import * as dgql from "../../../packages/client/src";

const {
  NEO4J_URI = "bolt://localhost:7687",
  NEO4J_USER = "admin",
  NEO4J_PASSWORD = "password",
} = process.env;

export const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

export const client = new dgql.Client({
  driver,
});
