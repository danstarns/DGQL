import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Client } from "../../client/src";
import { Button, Card, Spinner, Row, Col, Modal } from "react-bootstrap";
import DGQLEditor from "./DGQLEditor";
import Editor from "@monaco-editor/react";
import { Neo4jContext } from "use-neo4j";
import { Neo4jContextState } from "use-neo4j/dist/neo4j.context";
import * as HistoryContext from "./HistoryContext";
import HistoryModal from "./HistoryModal";
import { HistoryItem, Sample } from "./types";
import SamplesModal from "./SamplesModal";
import { prettify } from "./utils";

function App() {
  const history = useContext(HistoryContext.Context);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<any>();
  const [cypher, setCypher] = useState("");
  const [cypherParams, setCypherParams] = useState("{}");
  const [cypherStats, setCypherStats] = useState("{}");
  const [queryParams, setQueryParams] = useState("{}");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSamplesModal, setShowSamplesModal] = useState(false);
  const { driver } = useContext<Neo4jContextState>(Neo4jContext);
  const editorRef = useRef<typeof Editor>();
  const listenerRef = useRef<any>();

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
        shouldPrintError: true,
      };

      const translation = client.translate(options);

      history.addHistoryItem({
        dgql: options.query,
        params: options.variables,
      });
      setCypher(translation.cypher);
      setCypherParams(JSON.stringify(translation.params, null, 2));
      const { __STATS__, ...rest } = await client.run({
        ...options,
        includeStats: true,
      });

      setResponse(rest);
      setCypherStats(JSON.stringify(__STATS__, null, 2));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      session.close();
    }

    setTimeout(() => {
      setLoading(false);
    }, 600);
  }, [driver, queryParams]);

  const handleEditorDidMount = useCallback(
    (editor: typeof Editor, monaco) => {
      editorRef.current = editor;
      // @ts-ignore
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        function () {
          submit();
        }
      );
    },
    [submit]
  );

  useEffect(() => {
    return () => {
      document.removeEventListener("keydown", listenerRef.current);
    };
  }, []);

  useEffect(() => {
    if (listenerRef.current) {
      return;
    }

    const listener = document.addEventListener("keydown", (ev) => {
      if (
        (ev.ctrlKey || ev.metaKey) &&
        (ev.keyCode == 13 || ev.keyCode == 10)
      ) {
        submit();
      }
    });

    listenerRef.current = listener;
  }, [submit]);

  const handelHistoryAdd = useCallback((historyItem: HistoryItem) => {
    // @ts-ignore
    editorRef.current.setValue(historyItem.dgql);
    setQueryParams(JSON.stringify(historyItem.params, null, 2));
    setShowHistoryModal(false);
  }, []);

  const handelSampleAdd = useCallback((sample: Sample) => {
    // @ts-ignore
    editorRef.current.setValue(sample.sample);
    setShowSamplesModal(false);
  }, []);

  return (
    <>
      <Modal show={showHistoryModal} onHide={setShowHistoryModal}>
        <HistoryModal
          onClose={() => setShowHistoryModal(false)}
          onSelect={(h: HistoryItem) => handelHistoryAdd(h)}
        ></HistoryModal>
      </Modal>
      <Modal show={showSamplesModal} onHide={setShowSamplesModal}>
        <SamplesModal
          onClose={() => setShowSamplesModal(false)}
          onSelect={(s: Sample) => handelSampleAdd(s)}
        ></SamplesModal>
      </Modal>

      <div className="pl-3 pr-3">
        <Card className="m-3 p-3 d-flex align-items-start flex-row">
          <Button variant="primary" onClick={submit}>
            Submit (CTRL/CMD-Enter)
          </Button>

          <Button
            variant="outline-warning"
            className="ml-3"
            onClick={() => setShowHistoryModal(true)}
          >
            History
          </Button>

          <Button
            variant="outline-info"
            className="ml-3"
            onClick={() => setShowSamplesModal(true)}
          >
            Samples
          </Button>
          <Button
            variant="outline-secondary"
            className="ml-3"
            onClick={() => {
              // @ts-ignore
              editorRef.current.setValue(
                // @ts-ignore
                prettify(editorRef.current.getValue())
              );
            }}
          >
            Pretty
          </Button>
          <p className="ml-3 pt-1 font-weight-bold">
            <a href="https://github.com/danstarns/DGQL">
              https://github.com/danstarns/DGQL
            </a>
          </p>
        </Card>

        {loading && (
          <Card className="m-3 p-3 d-flex align-items-center">
            {loading && (
              <Spinner className="m-0 p-0" animation="border"></Spinner>
            )}
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
                      <DGQLEditor onMount={handleEditorDidMount}></DGQLEditor>
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
                        options={{ fontSize: "14" }}
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
                        height="100vh"
                        theme="vs-dark"
                        defaultLanguage="json"
                        value={
                          error
                            ? JSON.stringify(
                                {
                                  error: {
                                    message: {
                                      lines: error.split("\n").reduce(
                                        (res: any, v, i) => ({
                                          ...res,
                                          [i]: v,
                                        }),
                                        {}
                                      ),
                                    },
                                  },
                                },
                                null,
                                2
                              )
                            : JSON.stringify(response, null, 2)
                        }
                        options={{
                          fontSize: "14",
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
                          fontSize: "14",
                          readOnly: true,
                        }}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="p-3">
            <Col sm={6} className="mb-3">
              <Card bg={"light"}>
                <div className="p-3">
                  <h3>Cypher Params</h3>
                </div>
                <Card.Body>
                  <Editor
                    height="30vh"
                    theme="vs-dark"
                    defaultLanguage="json"
                    value={cypherParams}
                    options={{
                      fontSize: "14",
                      readOnly: true,
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} className="mb-3">
              <Card bg={"light"}>
                <div className="p-3">
                  <h3>Cypher Stats</h3>
                </div>
                <Card.Body>
                  <Editor
                    height="30vh"
                    theme="vs-dark"
                    defaultLanguage="json"
                    value={cypherStats}
                    options={{
                      fontSize: "14",
                      readOnly: true,
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}

export default App;
