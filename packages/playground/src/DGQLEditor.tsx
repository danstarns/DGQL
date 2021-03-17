import React from "react";
import Editor, { Monaco } from "@monaco-editor/react";

function createDependencyProposals(range, monaco: Monaco) {
    // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
    // here you could do a server side lookup
    return [
        {
            label: "Node",
            kind: monaco.languages.CompletionItemKind.Field,
            documentation: "A Node",
            insertText: "node @node",
            range: range,
        },
    ];
}

function DGQLEditor({
    onMount,
}: {
    onMount: (editor: typeof Editor, monaco: Monaco) => void;
}) {
    function beforeMount(monaco) {
        monaco.languages.registerCompletionItemProvider("graphql", {
            provideCompletionItems: (model, position) => {
                // find out if we are completing a property in the 'dependencies' object.
                const textUntilPosition = model.getValueInRange({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                });

                const match = textUntilPosition.match(/MATCH\s*\{\s*?$/);
                if (!match) {
                    return { suggestions: [] };
                }

                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                return {
                    suggestions: createDependencyProposals(range, monaco),
                };
            },
        });
    }

    return (
        <Editor
            height="80vh"
            theme="vs-dark"
            defaultLanguage="graphql"
            beforeMount={beforeMount}
            onMount={onMount}
            options={{ fontSize: "23", tabSize: 2 }}
        />
    );
}

export default DGQLEditor;
