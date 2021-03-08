import * as neo4j from "neo4j-driver";

let driver: neo4j.Driver | undefined;

async function connect(): Promise<neo4j.Driver> {
    if (driver) {
        return driver;
    }

    const {
        NEO_USER = "admin",
        NEO_PASSWORD = "password",
        NEO_URL = "neo4j://localhost:7687/neo4j",
    } = process.env;

    const auth = neo4j.auth.basic(NEO_USER, NEO_PASSWORD);

    driver = neo4j.driver(NEO_URL, auth);

    try {
        await driver.verifyConnectivity();
    } catch (error) {
        throw new Error(
            `Could not connect to neo4j @ ${NEO_URL} Error: ${error.message}`
        );
    }

    return driver;
}

export default connect;
