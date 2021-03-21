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
    NodeProjectInput,
    Edge,
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

function createProjectionSelectionAndParams({
    projectInput,
}: {
    projectInput: NodeProjectInput;
}): [FieldNode, any] {
    let params = {};

    const projectionSelections = Object.entries(projectInput)
        .filter((x) => x[1] instanceof Property || x[1] instanceof Edge)
        .map((x) => {
            const value = x[1] as Property | Edge;
            const key = x[0];

            if (value instanceof Property) {
                const selection: SelectionNode = {
                    kind: "Field",
                    name: { kind: "Name", value: key },
                };

                return selection;
            }

            if (value instanceof Edge) {
                const selection: SelectionNode = {
                    kind: "Field",
                    name: { kind: "Name", value: key },
                    directives: [],
                    selectionSet: { kind: "SelectionSet", selections: [] },
                };

                const edgeDirective: DirectiveNode = {
                    kind: "Directive",
                    name: { kind: "Name", value: "edge" },
                    arguments: [
                        {
                            kind: "Argument",
                            name: { kind: "Name", value: "type" },
                            value: {
                                kind: "EnumValue",
                                value: value.type,
                            },
                        },
                        {
                            kind: "Argument",
                            name: { kind: "Name", value: "direction" },
                            value: {
                                kind: "EnumValue",
                                value: value.direction,
                            },
                        },
                    ],
                };

                (selection.directives as DirectiveNode[]).push(edgeDirective);

                if (value.node) {
                    const nodeDirective: DirectiveNode = {
                        kind: "Directive",
                        name: {
                            kind: "Name",
                            value: "node",
                        },
                        arguments: [],
                    };

                    if (value.node.label) {
                        const labelArg: ArgumentNode = {
                            kind: "Argument",
                            name: { kind: "Name", value: "label" },
                            value: {
                                kind: "EnumValue",
                                value: value.node.label,
                            },
                        };

                        (nodeDirective.arguments as ArgumentNode[]).push(
                            labelArg
                        );
                    }

                    (selection.directives as DirectiveNode[]).push(
                        nodeDirective
                    );

                    if (value.projectInput) {
                        const [sel, p] = createProjectionSelectionAndParams({
                            projectInput: value.projectInput as NodeProjectInput,
                        });

                        params = { ...params, ...p };
                        // @ts-ignore
                        selection.selectionSet?.selections = sel.selectionSet
                            ?.selections as FieldNode[];
                    }
                }

                return selection;
            }
        }) as SelectionNode[];

    const projectionSelection: FieldNode = {
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

    return [projectionSelection, params];
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
                        const [
                            projectionSelection,
                            p,
                        ] = createProjectionSelectionAndParams({
                            projectInput: entry[1].projectInput,
                        });
                        params = { ...params, ...p };
                        selections.push(projectionSelection);
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
