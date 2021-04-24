import gql from "graphql-tag";
import { Builder, node, property } from "../../../src";
import { expectEqual } from "../../utils";

describe("match/where", () => {
  test("equal", () => {
    const builder = new Builder();
    const id = `some-random-id ${Math.random() * 100}`;

    const [dgql, params] = builder
      .match({
        node: node({ label: "Node" }).where({
          id: property({ equal: id }),
        }),
      })
      .return(["node"])
      .build();

    const expected = gql`
      {
        MATCH {
          node @node(label: Node) {
            WHERE {
              id(equal: $match_node_id_equal)
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
      match_node_id_equal: id,
    });
  });

  test("regex", () => {
    const builder = new Builder();
    const id = `some-random-id ${Math.random() * 100}`;

    const [dgql, params] = builder
      .match({
        node: node({ label: "Node" }).where({
          id: property({ regex: id }),
        }),
      })
      .return(["node"])
      .build();

    const expected = gql`
      {
        MATCH {
          node @node(label: Node) {
            WHERE {
              id(regex: $match_node_id_regex)
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
      match_node_id_regex: id,
    });
  });
});
