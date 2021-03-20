import {
    DocumentNode,
    FieldNode,
    SelectionNode,
    print,
    SelectionSetNode,
    ArgumentNode,
} from "graphql";
import { Node, Property } from "./classes";

function createReturnSelection(returnStrings: string[]): SelectionNode {
    return {
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
}

function createMatchSelectionNodesAndParams({
    matches,
}: {
    matches: { [k: string]: Node }[];
}): [SelectionNode[], any] {
    const params = {};

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

                    if (entry[1].whereInput) {
                        const whereSelection: SelectionNode = {
                            kind: "Field",
                            name: { kind: "Name", value: "WHERE" },
                            selectionSet: {
                                kind: "SelectionSet",
                                selections: Object.entries(entry[1].whereInput)
                                    .filter((e) => e[1] instanceof Property)
                                    .map((e) => {
                                        const field: FieldNode = {
                                            kind: "Field",
                                            name: { kind: "Name", value: e[0] },
                                        };
                                        const property = e[1] as Property;
                                        const args: ArgumentNode[] = [];

                                        if (property.equal !== undefined) {
                                            let paramName = `match_${entry[0]}_${e[0]}_equal`;

                                            params[paramName] = property.equal;

                                            args.push({
                                                kind: "Argument",
                                                name: {
                                                    kind: "Name",
                                                    value: "equal",
                                                },
                                                value: {
                                                    kind: "Variable",
                                                    name: {
                                                        kind: "Name",
                                                        value: paramName,
                                                    },
                                                },
                                            });
                                        }

                                        if (args.length) {
                                            (field.arguments as ArgumentNode[]) = args;
                                        }

                                        return field;
                                    }),
                            },
                        };

                        selections.push(whereSelection);
                    }

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

                    if (selections.length) {
                        (field.selectionSet as SelectionSetNode) = {
                            kind: "SelectionSet",
                            selections,
                        };
                    }

                    return field;
                }),
            },
        };

        return selection;
    });

    return [matchSelectionNodes, params];
}

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

    const returnSelectionNode = createReturnSelection(returnStrings);
    const [matchSelectionNodes, params] = createMatchSelectionNodesAndParams({
        matches,
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

    return [print(document), params];
}

export default createDGQLAndParams;
