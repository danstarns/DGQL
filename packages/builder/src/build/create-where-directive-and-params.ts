import { ArgumentNode, DirectiveNode } from "graphql";
import { Property, WhereInput } from "../classes";

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

export default createWhereDirectiveAndParams;
