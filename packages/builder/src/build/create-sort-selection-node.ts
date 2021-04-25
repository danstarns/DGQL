import { FieldNode, SelectionNode, ArgumentNode } from "graphql";
import { Property, NodeSort } from "../classes";

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

export default createSortSelectionNode;
