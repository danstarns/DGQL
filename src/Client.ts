import * as neo4j from "neo4j-driver";

class Client {
    driver: neo4j.Driver;

    constructor(input: { driver: neo4j.Driver }) {
        this.driver = input.driver;
    }
}

export default Client;
