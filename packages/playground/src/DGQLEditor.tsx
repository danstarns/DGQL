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

function createRootSuggestions(range, monaco: Monaco) {
    // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
    // here you could do a server side lookup
    return [
        {
            label: "MATCH",
            kind: monaco.languages.CompletionItemKind.Field,
            documentation: "MATCH",
            insertText: "MATCH {}",
            range: range,
        },
    ];
}

function DGQLEditor({
    onMount,
}: {
    onMount: (editor: typeof Editor, monaco: Monaco) => void;
}) {
    function beforeMount(monaco: Monaco) {
        monaco.languages.registerCompletionItemProvider("graphql", {
            provideCompletionItems: (model, position) => {
                // find out if we are completing a property in the 'dependencies' object.
                const textUntilPosition = model.getValueInRange({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                });

                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                console.log(textUntilPosition);
                const isInMatch = textUntilPosition.match(
                    /MATCH[\s\S]*{[\s\S]*$/
                );
                const atTop = textUntilPosition.match(
                    /[\s\S]*{[\s\S]*(MATCH[\s\S]*{[\s\S]*})?[\s\S]*[^MATCH[\s\S]*[{][\s\S]*]+$/
                );
                if (atTop && !isInMatch) {
                    return {
                        suggestions: createRootSuggestions(range, monaco),
                    };
                }

                if (isInMatch && !atTop) {
                    return {
                        suggestions: createDependencyProposals(range, monaco),
                    };
                }

                return { suggestions: [] };
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
            options={{ fontSize: "18", tabSize: 2 }}
        />
    );
}

export default DGQLEditor;
