import { Builder, node } from "../../../src";
import { expectEqual } from "../../utils";
import gql from "graphql-tag";

describe("create", () => {
  test("should create and return a node", () => {
    const builder = new Builder();

    const [dgql, params] = builder
      .create({
        node: node({ label: "Node" }),
      })
      .return(["node"])
      .build();

    const expected = gql`
      {
        CREATE {
          node @node(label: Node)
        }
        RETURN {
          node
        }
      }
    `;

    expectEqual({ received: dgql, expected });

    expect(params).toEqual({});
  });

  test("should create and return many node", () => {
    const builder = new Builder();

    const [dgql, params] = builder
      .create({
        node1: node({ label: "Node" }),
        node2: node({ label: "Node" }),
      })
      .return(["node1", "node2"])
      .build();

    const expected = gql`
      {
        CREATE {
          node1 @node(label: Node)
          node2 @node(label: Node)
        }
        RETURN {
          node1
          node2
        }
      }
    `;

    expectEqual({ received: dgql, expected });

    expect(params).toEqual({});
  });

  test("should create and return many node (many create)", () => {
    const builder = new Builder();

    const [dgql, params] = builder
      .create({
        node1: node({ label: "Node" }),
      })
      .create({
        node2: node({ label: "Node" }),
      })
      .return(["node1", "node2"])
      .build();

    const expected = gql`
      {
        CREATE {
          node1 @node(label: Node)
        }
        CREATE {
          node2 @node(label: Node)
        }
        RETURN {
          node1
          node2
        }
      }
    `;

    expectEqual({ received: dgql, expected });

    expect(params).toEqual({});
  });
});
