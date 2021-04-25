import { ArgumentNode, DirectiveNode } from "graphql";
import { NodePaginate } from "../classes";

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

export default createPaginationDirectiveNode;
