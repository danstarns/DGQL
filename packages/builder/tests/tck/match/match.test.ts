import { Builder, node } from "../../../src";
import { expectEqual } from "../../utils";
import gql from "graphql-tag";

describe("match", () => {
  test("should match and return a node", () => {
    const builder = new Builder();

    const [dgql, params] = builder
      .match({
        node: node({ label: "Node" }),
      })
      .return(["node"])
      .build();

    const expected = gql`
      {
        MATCH {
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

  test("should match and return many nodes (with 1 match)", () => {
    const builder = new Builder();

    const [dgql, params] = builder
      .match({
        node1: node({ label: "Node1" }),
        node2: node({ label: "Node2" }),
      })
      .return(["node1", "node2"])
      .build();

    const expected = gql`
      {
        MATCH {
          node1 @node(label: Node1)
          node2 @node(label: Node2)
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

  test("should match and return many nodes (with many match)", () => {
    const builder = new Builder();

    const [dgql, params] = builder
      .match({
        node1: node({ label: "Node1" }),
      })
      .match({
        node2: node({ label: "Node2" }),
      })
      .return(["node1", "node2"])
      .build();

    const expected = gql`
      {
        MATCH {
          node1 @node(label: Node1)
        }
        MATCH {
          node2 @node(label: Node2)
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
