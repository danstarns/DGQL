import React from "react";
import { Button, Card, Modal } from "react-bootstrap";
import Editor from "@monaco-editor/react";
import { print } from "graphql";
// @ts-ignore
import matchBlog from "../../../misc/recipes/match-blog.gql";
// @ts-ignore
import createBlog from "../../../misc/recipes/create-blog.gql";
// @ts-ignore
import matchMovies from "../../../misc/recipes/match-movie.gql";
// @ts-ignore
import createMovies from "../../../misc/recipes/create-movie.gql";
import { Sample } from "./types";
import { prettify } from "./utils";

const samples = [
    {
        name: "Create Blog",
        sample: prettify(print(createBlog)),
    },
    {
        name: "Match Blog",
        sample: prettify(print(matchBlog)),
    },
    {
        name: "Create Movie",
        sample: prettify(print(createMovies)),
    },
    {
        name: "Match Movie",
        sample: prettify(print(matchMovies)),
    },
];

function SampleItem({
    sample,
    select,
}: {
    sample: Sample;
    select: () => void;
}) {
    return (
        <Card className="mt-3 p-3">
            <Card.Body>
                <Card.Header>{sample.name}</Card.Header>
                <Editor
                    height="30vh"
                    theme="vs-dark"
                    defaultLanguage="graphql"
                    options={{ fontSize: "12", readOnly: true }}
                    value={sample.sample}
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

function SamplesModal({
    onClose,
    onSelect,
}: {
    onClose: () => void;
    onSelect: (sample: Sample) => void;
}) {
    return (
        <>
            <Modal.Header closeButton>
                <Modal.Title>Samples</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ overflowY: "scroll", height: "60vh" }}>
                    {samples.map((s) => (
                        <SampleItem
                            key={s.name}
                            sample={s}
                            select={() => onSelect(s)}
                        ></SampleItem>
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

export default SamplesModal;
