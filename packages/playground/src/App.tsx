import React, { useCallback, useContext, useRef, useState } from "react";
import { Client } from "../../client/src";
import { Button, Card, Spinner, Alert, Row, Col } from "react-bootstrap";
import DGQLEditor from "./DGQLEditor";
import Editor from "@monaco-editor/react";
import { Neo4jContext } from "use-neo4j";
import { Neo4jContextState } from "use-neo4j/dist/neo4j.context";

function App() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [response, setResponse] = useState<any>();
    const [cypher, setCypher] = useState("");
    const [queryParams, setQueryParams] = useState("{}");
    const { driver } = useContext<Neo4jContextState>(Neo4jContext);
    const editorRef = useRef<typeof Editor>();

    function handleEditorDidMount(editor: typeof Editor) {
        editorRef.current = editor;
    }

    const submit = useCallback(async () => {
        setLoading(true);

        const session = driver.session();

        // @ts-ignore
        const client = new Client({ driver });

        try {
            const options = {
                // @ts-ignore
                query: editorRef.current.getValue(),
                variables: JSON.parse(queryParams),
            };

            const translation = client.translate(options);

            setCypher(translation.cypher);
            setResponse(await client.run(options));
            setError("");
        } catch (e) {
            console.error(e);
            setError(e.message);
        } finally {
            session.close();
        }

        setLoading(false);
    }, [driver, queryParams]);

    return (
        <div>
            <Card className="m-2 p-2">
                <Button variant="primary" block={true} onClick={submit}>
                    Submit
                </Button>
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

            <div className="pl-3 pr-3">
                <Row className="pl-3 pr-3">
                    <Col sm={6} className="p-3">
                        <Row>
                            <Col sm={12} className="mb-3">
                                <Card bg={"light"}>
                                    <div className="p-3">
                                        <h3>DGQL Query</h3>
                                    </div>
                                    <Card.Body>
                                        <DGQLEditor
                                            onMount={handleEditorDidMount}
                                        ></DGQLEditor>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm={12} className="mt-3">
                                <Card bg={"light"}>
                                    <div className="p-3">
                                        <h3>DGQL Params</h3>
                                    </div>
                                    <Card.Body>
                                        <Editor
                                            height="30vh"
                                            theme="vs-dark"
                                            defaultLanguage="json"
                                            options={{ fontSize: "30" }}
                                            value={queryParams}
                                            onChange={(v) => setQueryParams(v)}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={6} className="p-3">
                        <Row>
                            <Col sm={12} className="mb-3">
                                <Card bg={"light"}>
                                    <div className="p-3">
                                        <h3>Response</h3>
                                    </div>
                                    <Card.Body>
                                        <Editor
                                            height="80vh"
                                            theme="vs-dark"
                                            defaultLanguage="json"
                                            value={JSON.stringify(
                                                response,
                                                null,
                                                2
                                            )}
                                            options={{
                                                fontSize: "23",
                                                readOnly: true,
                                            }}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm={12} className="mt-3">
                                <Card bg={"light"}>
                                    <div className="p-3">
                                        <h3>Cypher Query</h3>
                                    </div>
                                    <Card.Body>
                                        <Editor
                                            height="30vh"
                                            theme="vs-dark"
                                            value={cypher}
                                            options={{
                                                fontSize: "23",
                                                readOnly: true,
                                            }}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default App;
