import { FieldNode, SelectionNode } from "graphql";
import { CreateInput } from "../types";
import { createSetSelectionAndParams } from ".";

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

export default createCreateSelectionNodeAndParams;
