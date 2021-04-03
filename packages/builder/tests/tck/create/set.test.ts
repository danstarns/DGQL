import { Builder, node, property } from "../../../src";
import { expectEqual } from "../../utils";
import gql from "graphql-tag";
import randomstring from "randomstring";

describe("create", () => {
  test("should create and set a property on a node", () => {
    const id = randomstring.generate({
      charset: "alphabetic",
    });

    const builder = new Builder();

    const [dgql, params] = builder
      .create({
        node: node({ label: "Node" }).set({
          id: property({ value: id }),
        }),
      })
      .return(["node"])
      .build();

    const expected = gql`
      {
        CREATE {
          node @node(label: Node) {
            SET {
              id(value: $create_node_set_id)
            }
          }
        }
        RETURN {
          node
        }
      }
    `;

    expectEqual({ received: dgql, expected });

    expect(params).toEqual({
      create_node_set_id: id,
    });
  });

  test("should create and set many property on a node", () => {
    const id1 = randomstring.generate({
      charset: "alphabetic",
    });
    const id2 = randomstring.generate({
      charset: "alphabetic",
    });

    const builder = new Builder();

    const [dgql, params] = builder
      .create({
        node: node({ label: "Node" }).set({
          id1: property({ value: id1 }),
          id2: property({ value: id2 }),
        }),
      })
      .return(["node"])
      .build();

    const expected = gql`
      {
        CREATE {
          node @node(label: Node) {
            SET {
              id1(value: $create_node_set_id1)
              id2(value: $create_node_set_id2)
            }
          }
        }
        RETURN {
          node
        }
      }
    `;

    expectEqual({ received: dgql, expected });

    expect(params).toEqual({
      create_node_set_id1: id1,
      create_node_set_id2: id2,
    });
  });
});
