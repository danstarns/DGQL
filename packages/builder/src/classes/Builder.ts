import { DocumentNode, FieldNode, print, SelectionNode } from "graphql";
import Node from "./Node";

interface MatchInput {
    [k: string]: Node;
}

class Builder {
    matches: MatchInput[];

    returnInput?: string[];

    constructor() {
        this.matches = [];
    }

    match(input: MatchInput): Builder {
        this.matches.push(input);

        return this;
    }

    return(input: string[]): Builder {
        this.returnInput = input;

        return this;
    }

    build(): [string, Record<string, unknown>] {
        if (!this.matches.length) {
            return ["", {}];
        }

        const returnSelectionNode: SelectionNode = {
            kind: "Field",
            name: { kind: "Name", value: "RETURN" },
            ...(this.returnInput && Object.keys(this.returnInput).length
                ? {
                      selectionSet: {
                          kind: "SelectionSet",
                          selections: this.returnInput.map((key) => {
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

        const matches: SelectionNode[] = this.matches.map((match) => {
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
                            selections = Object.entries(
                                entry[1].projectInput
                            ).map((e) => {
                                const selection: SelectionNode = {
                                    kind: "Field",
                                    name: { kind: "Name", value: e[0] },
                                };

                                return selection;
                            });
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
                        selections: [...matches, returnSelectionNode],
                    },
                },
            ],
        };

        return [print(document), {}];
    }
}

export default Builder;
