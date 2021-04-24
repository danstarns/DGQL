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
  Property,
  WhereInput,
  NodePaginate,
  NodeSort,
  NodeProjectInput,
  Edge,
} from "./classes";
import type { CreateInput, MatchInput, Operation, SetInput } from "./types";

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

          const operators = ["equal", "regex"];

          operators.forEach((operator) => {
            if (property[operator] === undefined) {
              return;
            }

            let paramName = `${parentName}_${e[0]}_${operator}`;

            params[paramName] = property[operator];

            args.push({
              kind: "Argument",
              name: {
                kind: "Name",
                value: operator,
              },
              value: {
                kind: "Variable",
                name: {
                  kind: "Name",
                  value: paramName,
                },
              },
            });
          });

          if (args.length) {
            (field.arguments as ArgumentNode[]) = args;
          }

          return field;
        }),
    },
  };

  return [whereSelection, params];
}

function createWhereDirectiveAndParams({
  whereInput,
  parentName,
}: {
  whereInput: WhereInput;
  parentName: string;
}): [DirectiveNode, any] {
  const params = {};

  const directive: DirectiveNode = {
    kind: "Directive",
    name: {
      kind: "Name",
      value: "where",
    },
    arguments: Object.entries(whereInput)
      .filter((e) => e[1] instanceof Property)
      .map((wI) => {
        const paramName = `${parentName}_${wI[0]}`;

        const arg: ArgumentNode = {
          kind: "Argument",
          name: {
            kind: "Name",
            value: wI[0],
          },
          value: {
            kind: "Variable",
            name: {
              kind: "Name",
              value: paramName,
            },
          },
        };

        params[paramName] = wI[0];

        return arg;
      }),
  };

  return [directive, params];
}

function createPaginationDirectiveNode({
  paginateInput,
}: {
  paginateInput: NodePaginate;
}): DirectiveNode {
  const { skip, limit } = paginateInput;

  const directive: DirectiveNode = {
    kind: "Directive",
    name: { kind: "Name", value: "paginate" },
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
  parentName,
}: {
  projectInput: NodeProjectInput;
  parentName: string;
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

            (nodeDirective.arguments as ArgumentNode[]).push(labelArg);
          }

          (selection.directives as DirectiveNode[]).push(nodeDirective);

          if (value.projectInput) {
            const [sel, p] = createProjectionSelectionAndParams({
              projectInput: value.projectInput as NodeProjectInput,
              parentName: `${parentName}_${key}`,
            });

            params = { ...params, ...p };
            // @ts-ignore
            selection.selectionSet?.selections = sel.selectionSet
              ?.selections as FieldNode[];
          }

          if (value.node.whereInput) {
            const [whereDirec, p] = createWhereDirectiveAndParams({
              whereInput: value.node.whereInput,
              parentName: `${parentName}_${key}_where`,
            });
            params = { ...params, ...p };
            (selection.directives as DirectiveNode[]).push(whereDirec);
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

function createMatchSelectionNodeAndParams({
  match,
}: {
  match: MatchInput;
}): [SelectionNode, any] {
  let params = {};

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
          const [whereSelection, p] = createWhereSelectionAndParams({
            parentName: `match_${entry[0]}`,
            whereInput: entry[1].whereInput,
          });
          params = { ...params, ...p };
          selections.push(whereSelection);
        }

        if (entry[1].paginateInput) {
          const directive = createPaginationDirectiveNode({
            paginateInput: entry[1].paginateInput,
          });

          if (directive.arguments?.length) {
            (field.directives as DirectiveNode[]).push(directive);
          }

          if (entry[1].paginateInput?.sort) {
            const selection = createSortSelectionNode({
              sortInput: entry[1].paginateInput.sort,
            });

            selections.push(selection);
          }
        }

        if (entry[1].projectInput) {
          const [projectionSelection, p] = createProjectionSelectionAndParams({
            parentName: `match_${entry[0]}`,
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

  return [selection, params];
}

function createSetSelectionAndParams({
  parentName,
  setInput,
}: {
  parentName: string;
  setInput: SetInput;
}): [FieldNode, any] {
  let params = {};

  const field: FieldNode = {
    kind: "Field",
    name: {
      kind: "Name",

      value: "SET",
    },
    selectionSet: { kind: "SelectionSet", selections: [] },
  };

  Object.entries(setInput)
    .filter((entry) => entry[1] instanceof Property)
    .forEach((entry) => {
      const property = entry[1] as Property;
      const selection: FieldNode = {
        kind: "Field",
        name: { kind: "Name", value: entry[0] },
      };

      if (!property.value) {
        throw new Error("SET property value required");
      }

      const args: ArgumentNode[] = [];
      const value = property.value;
      const paramName = `${parentName}_${entry[0]}`;

      args.push({
        kind: "Argument",
        name: {
          kind: "Name",
          value: "value",
        },
        value: {
          kind: "Variable",
          name: {
            kind: "Name",
            value: paramName,
          },
        },
      });

      (selection.arguments as ArgumentNode[]) = args;
      params[paramName] = value;
      (field.selectionSet?.selections as SelectionNode[]).push(selection);
    });

  return [field, params];
}

function createCreateSelectionNodeAndParams({
  create,
}: {
  create: CreateInput;
}): [SelectionNode, any] {
  let params = {};

  const selection: SelectionNode = {
    kind: "Field",
    name: { kind: "Name", value: "CREATE" },
    selectionSet: {
      kind: "SelectionSet",
      selections: Object.entries(create).map((entry) => {
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
          selectionSet: {
            kind: "SelectionSet",
            selections: [],
          },
        };

        if (entry[1].setInput && Object.keys(entry[1].setInput)) {
          const sSAP = createSetSelectionAndParams({
            parentName: `create_${entry[0]}_set`,
            setInput: entry[1].setInput,
          });
          params = { ...params, ...sSAP[1] };
          (field.selectionSet?.selections as SelectionNode[]).push(sSAP[0]);
        }

        return field;
      }),
    },
  };

  return [selection, params];
}

function createDGQLAndParams({
  operations,
  returnStrings,
}: {
  operations: Operation[];
  returnStrings: string[];
}): [string, any] {
  let params = {};
  let selections: SelectionNode[] = [];
  if (!operations.length) {
    return ["", {}];
  }

  operations.forEach((operation) => {
    switch (operation.kind) {
      case "CREATE":
        {
          const cSAP = createCreateSelectionNodeAndParams({
            create: operation.input,
          });
          selections.push(cSAP[0]);
          params = { ...params, ...cSAP[1] };
        }
        break;
      default: {
        const mSAP = createMatchSelectionNodeAndParams({
          match: operation.input,
        });
        selections.push(mSAP[0]);
        params = { ...params, ...mSAP[1] };
      }
    }
  });

  const returnSelectionNode = createReturnSelection(returnStrings);
  selections.push(returnSelectionNode);

  const document: DocumentNode = {
    kind: "Document",
    definitions: [
      {
        kind: "OperationDefinition",
        operation: "query",
        selectionSet: {
          kind: "SelectionSet",
          selections,
        },
      },
    ],
  };

  return [print(document), params];
}

export default createDGQLAndParams;
