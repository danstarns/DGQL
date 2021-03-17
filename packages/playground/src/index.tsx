import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { Neo4jProvider } from "use-neo4j";
import { Neo4jScheme } from "use-neo4j/dist/neo4j-config.interface";

const defaults = {
    NEO_SCHEME: "bolt" as Neo4jScheme,
    NEO_URL: "localhost",
    NEO_PORT: "7687",
    NEO_USER: "admin",
    NEO_PASSWORD: "password",
    NEO_DATABASE: "neo4j",
};

function Wrapper() {
    return (
        <Neo4jProvider
            scheme={defaults.NEO_SCHEME}
            host={defaults.NEO_URL}
            port={defaults.NEO_PORT}
            username={defaults.NEO_USER}
            password={defaults.NEO_PASSWORD}
            database={defaults.NEO_DATABASE}
        >
            <App />
        </Neo4jProvider>
    );
}

ReactDOM.render(<Wrapper />, document.querySelector("#root"));
