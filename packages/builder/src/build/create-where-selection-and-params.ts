import { FieldNode, SelectionNode, ArgumentNode } from "graphql";
import { Property, WhereInput } from "../classes";

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

export default createWhereSelectionAndParams;
