import React, { useCallback, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";

function DGQLEditor({
  onMount,
}: {
  onMount: (editor: typeof Editor, monaco: Monaco) => void;
}) {
  const monacoRef = useRef();

  const beforeMount = useCallback((monaco: Monaco) => {
    monacoRef.current = monaco;

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

        const isSelectingDirective = textUntilPosition.match(
          /[\s\S]*@(?![\s\S])/
        );

        if (isSelectingDirective) {
          return {
            suggestions: [
              {
                label: "@node",
                insertText: "node(label: Node)",
                range: range,
              },
              {
                label: "@edge",
                insertText: "edge(type: HAS_NODE, direction: OUT)",
                range: range,
              },
              {
                label: "@paginate",
                insertText: "paginate(skip: 1, limit: 10)",
                range: range,
              },
              {
                label: "@where",
                insertText: 'where(id: "some-id")',
                range: range,
              },
            ],
          };
        }

        const isInNode = textUntilPosition.match(/[\s\S]*@node\([\s\S]*/);

        if (isInNode) {
          return {
            suggestions: [
              {
                label: "label",
                insertText: "label: Node",
                range: range,
              },
            ],
          };
        }

        const isInEdge = textUntilPosition.match(/[\s\S]*@edge\([\s\S]*/);

        if (isInEdge) {
          const hasType = textUntilPosition.match(
            /[\s\S]*@edge\([\s\S]*type:[\s\S]*/
          );
          const hasDirection = textUntilPosition.match(
            /[\s\S]*@edge\([\s\S]*direction:[\s\S]*/
          );

          if (hasType && hasDirection) {
            return {
              suggestions: [],
            };
          }

          if (hasType && !hasDirection) {
            return {
              suggestions: [
                {
                  label: "direction",
                  insertText: ", direction: OUT",
                  range: range,
                },
              ],
            };
          }

          if (hasDirection) {
            return {
              suggestions: [
                {
                  label: "type",
                  insertText: ", type: HAS_NODE",
                  range: range,
                },
              ],
            };
          }

          return {
            suggestions: [
              {
                label: "type",
                insertText: "type: HAS_NODE",
                range: range,
              },
              {
                label: "direction",
                insertText: "direction: OUT",
                range: range,
              },
            ],
          };
        }

        return {
          suggestions: [
            // TODO in progress
            // {
            //   label: "MATCH",
            //   kind: monaco.languages.CompletionItemKind.Field,
            //   documentation: "MATCH",
            //   insertText: "MATCH {}",
            //   range: range,
            // },
            // {
            //   label: "CREATE",
            //   kind: monaco.languages.CompletionItemKind.Field,
            //   documentation: "CREATE",
            //   insertText: "CREATE {}",
            //   range: range,
            // },
          ],
        };
      },
    });
  }, []);

  return (
    <Editor
      height="100vh"
      theme="vs-dark"
      defaultLanguage="graphql"
      beforeMount={beforeMount}
      onMount={(e) => onMount(e, monacoRef.current)}
      options={{ fontSize: "14", tabSize: 2 }}
    />
  );
}

export default DGQLEditor;
