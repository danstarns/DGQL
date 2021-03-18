import React, { useContext } from "react";
import { Button, Card, Modal } from "react-bootstrap";
import Editor from "@monaco-editor/react";
import * as HistoryContext from "./HistoryContext";
import { HistoryItem } from "./types";

function HistoryItemComponent({
    historyItem,
    select,
}: {
    historyItem: HistoryItem;
    select: () => void;
}) {
    return (
        <Card className="mt-3 p-3">
            <Card.Body>
                <Card.Header>
                    {new Date(historyItem.createdAt).toISOString()}
                </Card.Header>
                <Editor
                    height="30vh"
                    theme="vs-dark"
                    defaultLanguage="graphql"
                    options={{ fontSize: "12", readOnly: true }}
                    value={historyItem.dgql}
                />
            </Card.Body>
            <Card.Footer>
                <Button variant="outline-primary" onClick={() => select()}>
                    Select
                </Button>
            </Card.Footer>
        </Card>
    );
}

function HistoryModal({
    onClose,
    onSelect,
}: {
    onClose: () => void;
    onSelect: (historyItem: HistoryItem) => void;
}) {
    const history = useContext(HistoryContext.Context);

    return (
        <>
            <Modal.Header closeButton>
                <Modal.Title>History</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ overflowY: "scroll", height: "60vh" }}>
                    {history.history
                        .sort((a, b) => {
                            const dt1 = new Date(b.createdAt);
                            const dt2 = new Date(a.createdAt);

                            if (dt1 > dt2) {
                                return 1;
                            }

                            if (dt1 < dt2) {
                                return -1;
                            }

                            return 0;
                        })
                        .map((h) => (
                            <HistoryItemComponent
                                key={h.createdAt}
                                historyItem={h}
                                select={() => onSelect(h)}
                            ></HistoryItemComponent>
                        ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </>
    );
}

export default HistoryModal;
