import {
    DocumentNode,
    FieldNode,
    SelectionNode,
    print,
    SelectionSetNode,
    ArgumentNode,
    DirectiveNode,
} from "graphql";
import {
    Node,
    Property,
    WhereInput,
    NodePagination,
    NodeSort,
} from "./classes";

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

function createWhereSelectionAndParams({
    whereInput,
    parentName,
}: {
    whereInput: WhereInput;
    parentName: string;
}): [SelectionNode, any] {
    const params = {};

    const whereSelection: SelectionNode = {
        kind: "Field",
        name: { kind: "Name", value: "WHERE" },
        selectionSet: {
            kind: "SelectionSet",
            selections: Object.entries(whereInput)
                .filter((e) => e[1] instanceof Property)
                .map((e) => {
                    const field: FieldNode = {
                        kind: "Field",
                        name: { kind: "Name", value: e[0] },
                    };
                    const property = e[1] as Property;
                    const args: ArgumentNode[] = [];

                    if (property.equal !== undefined) {
                        let paramName = `${parentName}_${e[0]}_equal`;

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

    return [whereSelection, params];
}

function createPaginationDirectiveNode({
    paginationInput,
}: {
    paginationInput: NodePagination;
}): DirectiveNode {
    const { skip, limit } = paginationInput;

    const directive: DirectiveNode = {
        kind: "Directive",
        name: { kind: "Name", value: "pagination" },
        arguments: [],
    };

    if (typeof skip === "number") {
        const arg: ArgumentNode = {
            kind: "Argument",
            name: { kind: "Name", value: "skip" },
            value: {
                kind: "IntValue",
                value: skip.toString(),
            },
        };

        (directive.arguments as ArgumentNode[]).push(arg);
    }

    if (typeof limit === "number") {
        const arg: ArgumentNode = {
            kind: "Argument",
            name: { kind: "Name", value: "limit" },
            value: {
                kind: "IntValue",
                value: limit.toString(),
            },
        };

        (directive.arguments as ArgumentNode[]).push(arg);
    }

    return directive;
}

function createSortSelectionNode({
    sortInput,
}: {
    sortInput: NodeSort;
}): SelectionNode {
    const selection: SelectionNode = {
        kind: "Field",
        name: { kind: "Name", value: "SORT" },
        selectionSet: {
            kind: "SelectionSet",
            selections: Object.entries(sortInput)
                .filter((p) => p[1] instanceof Property)
                .map((p) => {
                    const field: FieldNode = {
                        kind: "Field",
                        name: {
                            kind: "Name",
                            value: p[0],
                        },
                        arguments: [],
                    };

                    if (p[1].direction) {
                        const arg: ArgumentNode = {
                            kind: "Argument",
                            name: {
                                kind: "Name",
                                value: "direction",
                            },
                            value: {
                                kind: "EnumValue",
                                value: p[1].direction,
                            },
                        };

                        (field.arguments as ArgumentNode[]).push(arg);
                    }

                    return field;
                }),
        },
    };

    return selection;
}

function createMatchSelectionNodesAndParams({
    matches,
}: {
    matches: { [k: string]: Node }[];
}): [SelectionNode[], any] {
    let params = {};

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
                        const [
                            whereSelection,
                            p,
                        ] = createWhereSelectionAndParams({
                            parentName: `match_${entry[0]}`,
                            whereInput: entry[1].whereInput,
                        });

                        params = { ...params, ...p };
                        selections.push(whereSelection);
                    }

                    if (entry[1].paginationInput) {
                        const directive = createPaginationDirectiveNode({
                            paginationInput: entry[1].paginationInput,
                        });

                        if (directive.arguments?.length) {
                            (field.directives as DirectiveNode[]).push(
                                directive
                            );
                        }

                        if (entry[1].paginationInput?.sort) {
                            const selection = createSortSelectionNode({
                                sortInput: entry[1].paginationInput.sort,
                            });

                            selections.push(selection);
                        }
                    }

                    if (entry[1].projectInput) {
                        const projectionSelections = Object.entries(
                            entry[1].projectInput
                        )
                            .filter((x) => x[1] instanceof Property)
                            .map((e) => {
                                const selection: SelectionNode = {
                                    kind: "Field",
                                    name: { kind: "Name", value: e[0] },
                                };

                                return selection;
                            });

                        if (projectionSelections.length) {
                            const projectionSelection: SelectionNode = {
                                kind: "Field",
                                name: {
                                    kind: "Name",
                                    value: "PROJECT",
                                },
                                selectionSet: {
                                    kind: "SelectionSet",
                                    selections: projectionSelections,
                                },
                            };

                            selections.push(projectionSelection);
                        }
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
