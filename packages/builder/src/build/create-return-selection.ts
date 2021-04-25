import { SelectionNode } from "graphql";

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

export default createReturnSelection;
