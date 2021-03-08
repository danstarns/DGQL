import React, { useCallback, useEffect, useRef, useState } from "react";
import * as neo4j from "neo4j-driver";
import { Client } from "../../client/src";
import { Button, Card, Spinner, Alert, Row, Col, Form } from "react-bootstrap";
import CodeMirror from "codemirror";
import ReactJson from "react-json-view";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror-graphql/mode";
import "cypher-codemirror/dist/cypher-codemirror-all.css";
import "cypher-codemirror/dist/cypher-codemirror.js";

const defaults = {
    NEO_URL: "bolt://localhost:7687",
    NEO_USER: "admin",
    NEO_PASSWORD: "password",
    NEO_DATABASE: "neo4j",
};

function App() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [response, setResponse] = useState<any>();
    const [cypher, setCypher] = useState("");
    const [cypherParams, setCypherParams] = useState({});
    const queryMirror = useRef<CodeMirror.EditorFromTextArea>();
    const cypherMirror = useRef<CodeMirror.EditorFromTextArea>();
    const jsonMirror = useRef<CodeMirror.EditorFromTextArea>();
    const [url, setUrl] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState("");
    const [database, setDatabase] = useState("");
    const [driver, setDriver] = useState<neo4j.Driver>();

    useEffect(() => {
        setUrl(defaults.NEO_URL);
        setUser(defaults.NEO_USER);
        setDatabase(defaults.NEO_DATABASE);
        setPassword(defaults.NEO_PASSWORD);

        try {
            setDriver(
                neo4j.driver(
                    defaults.NEO_URL,
                    neo4j.auth.basic(defaults.NEO_USER, defaults.NEO_PASSWORD)
                )
            );
        } catch (error) {}
    }, []);

    useEffect(() => {
        if (url && user && password) {
            try {
                setDriver(neo4j.driver(url, neo4j.auth.basic(user, password)));
            } catch (error) {}
        }
    }, [url, password, user]);

    const submit = useCallback(async () => {
        setLoading(true);
        const session = driver.session({ database: database });
        // @ts-ignore
        const client = new Client({ driver });

        try {
            const options = {
                query: queryMirror.current.getValue(),
                variables: (JSON.parse(
                    jsonMirror.current.getValue()
                ) as unknown) as Record<string, unknown>,
            };

            const translation = client.translate(options);

            setCypher(translation.cypher);
            setCypherParams(translation.params);
            setResponse(await client.run(options));
            setError("");
        } catch (e) {
            console.error(e);
            setError(e.message);
        } finally {
            session.close();
        }

        setLoading(false);
    }, [driver, database]);

    useEffect(() => {
        const queryArea = document.getElementById(
            "query-text-area"
        ) as HTMLTextAreaElement;

        queryMirror.current = CodeMirror.fromTextArea(queryArea, {
            mode: "graphql",
            theme: "monokai",
            autofocus: true,
            autocorrect: true,
            lineNumbers: true,
            indentWithTabs: true,
            smartIndent: false,
            lint: true,
            // @ts-ignore
            autoCloseBrackets: true,
        });

        const jsonParamsArea = document.getElementById(
            "query-params-text-area"
        ) as HTMLTextAreaElement;

        jsonMirror.current = CodeMirror.fromTextArea(jsonParamsArea, {
            mode: "json",
            theme: "monokai",
            lineNumbers: true,
            indentWithTabs: true,
            smartIndent: false,
            // @ts-ignore
            autoCloseBrackets: true,
        });

        jsonMirror.current.setValue("{}");
    }, []);

    useEffect(() => {
        if (cypherMirror.current) {
            cypherMirror.current.refresh();
            cypherMirror.current.setValue(cypher.trimRight());

            return;
        }

        const el = document.getElementById(
            "cypher-text-area"
        ) as HTMLTextAreaElement;

        cypherMirror.current = CodeMirror.fromTextArea(el, {
            mode: "cypher",
            theme: "monokai",
            lineNumbers: true,
            readOnly: true,
        });

        cypherMirror.current.setValue(cypher.trimRight());
    }, [cypher]);

    return (
        <div>
            <Card className="m-2 p-2">
                <Button variant="primary" block={true} onClick={submit}>
                    Submit
                </Button>
            </Card>

            <Card className="m-2 p-2">
                <Form>
                    <h2>Connection Config</h2>
                    <Form.Group controlId="url">
                        <Form.Label>URL</Form.Label>
                        <Form.Control
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            Default: {defaults.NEO_URL}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="database">
                        <Form.Label>Database</Form.Label>
                        <Form.Control
                            type="text"
                            value={database}
                            onChange={(e) => setDatabase(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            Default: {defaults.NEO_DATABASE}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="user">
                        <Form.Label>User</Form.Label>
                        <Form.Control
                            type="text"
                            value={user}
                            onChange={(e) => setUser(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            Default: {defaults.NEO_USER}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            Default: {defaults.NEO_PASSWORD}
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Card>

            {loading && (
                <Card className="m-2">
                    <Spinner animation="border" className="mx-auto"></Spinner>
                </Card>
            )}

            {error && (
                <Card className="m-2">
                    <Alert variant="danger">{error}</Alert>
                </Card>
            )}
            <Row className="p-3">
                <Col sm={12} className="p-3">
                    <h2>Query</h2>

                    <Card className="p-3">
                        <textarea id="query-text-area"></textarea>
                    </Card>
                </Col>

                <Col sm={12} className="p-3">
                    <h2>Query Params</h2>

                    <Card className="p-3">
                        <textarea id="query-params-text-area"></textarea>
                    </Card>
                </Col>

                <Col sm={12} className="p-3">
                    <h2>Cypher Query</h2>
                    <Card className="p-3">
                        <textarea id="cypher-text-area"></textarea>
                    </Card>
                </Col>

                <Col sm={12} className="p-3">
                    <h2>Cypher Params</h2>
                    <Card className="p-3">
                        <ReactJson
                            style={{
                                width: "100%",
                                overflow: "scroll",
                                fontSize: "1.6em",
                            }}
                            src={cypherParams}
                            displayObjectSize={false}
                            enableClipboard={false}
                            displayDataTypes={false}
                            shouldCollapse={false}
                            theme="monokai"
                        />
                    </Card>
                </Col>

                <Col sm={12} className="p-3">
                    <h2>Response</h2>
                    <Card className="p-3">
                        <ReactJson
                            style={{
                                width: "100%",
                                overflow: "scroll",
                                fontSize: "1.6em",
                            }}
                            src={response}
                            displayObjectSize={false}
                            enableClipboard={false}
                            displayDataTypes={false}
                            shouldCollapse={false}
                            theme="monokai"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default App;
