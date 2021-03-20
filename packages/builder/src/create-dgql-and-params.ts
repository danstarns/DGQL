import { DocumentNode, FieldNode, SelectionNode, print } from "graphql";
import { Node } from "./classes";

function createDGQLAndParams({
    matches,
    returnStrings,
}: {
    matches: { [k: string]: Node }[];
    returnStrings: string[];
}): [string, any] {
    if (!matches.length) {
        return ["", {}];
    }

    const returnSelectionNode: SelectionNode = {
        kind: "Field",
        name: { kind: "Name", value: "RETURN" },
        ...(returnStrings.length
            ? {
                  selectionSet: {
                      kind: "SelectionSet",
                      selections: returnStrings.map((key) => {
                          const selection: SelectionNode = {
                              kind: "Field",
                              name: { kind: "Name", value: key },
                          };

                          return selection;
                      }),
                  },
              }
            : {}),
    };

    const matchSelectionNodes: SelectionNode[] = matches.map((match) => {
        const selection: SelectionNode = {
            kind: "Field",
            name: { kind: "Name", value: "MATCH" },
            selectionSet: {
                kind: "SelectionSet",
                selections: Object.entries(match).map((entry) => {
                    const field: FieldNode = {
                        kind: "Field",
                        name: { kind: "Name", value: entry[0] },
                        directives: [
                            {
                                kind: "Directive",
                                name: { kind: "Name", value: "node" },
                                ...(entry[1].label
                                    ? {
                                          arguments: [
                                              {
                                                  kind: "Argument",
                                                  name: {
                                                      kind: "Name",
                                                      value: "label",
                                                  },
                                                  value: {
                                                      kind: "EnumValue",
                                                      value: entry[1].label,
                                                  },
                                              },
                                          ],
                                      }
                                    : {}),
                            },
                        ],
                    };

                    let selections: SelectionNode[] = [];
                    if (entry[1].projectInput) {
                        selections = Object.entries(entry[1].projectInput).map(
                            (e) => {
                                const selection: SelectionNode = {
                                    kind: "Field",
                                    name: { kind: "Name", value: e[0] },
                                };

                                return selection;
                            }
                        );
                    }

                    return field;
                }),
            },
        };

        return selection;
    });

    const document: DocumentNode = {
        kind: "Document",
        definitions: [
            {
                kind: "OperationDefinition",
                operation: "query",
                selectionSet: {
                    kind: "SelectionSet",
                    selections: [...matchSelectionNodes, returnSelectionNode],
                },
            },
        ],
    };

    return [print(document), {}];
}

export default createDGQLAndParams;
