import { FieldNode, SelectionNode, ArgumentNode } from "graphql";
import { Property } from "../classes";
import { SetInput } from "../types";

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

export default createSetSelectionAndParams;
