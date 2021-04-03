import gql from "graphql-tag";
import { Builder, edge, node, property } from "../../../src";
import { expectEqual } from "../../utils";

describe("match/projection", () => {
  describe("property", () => {
    test("should match and project many node property", () => {
      const builder = new Builder();

      const [dgql, params] = builder
        .match({
          node: node({ label: "Node" }).project({
            id: property(),
            name: property(),
          }),
        })
        .return(["node"])
        .build();

      const expected = gql`
        {
          MATCH {
            node @node(label: Node) {
              PROJECT {
                id
                name
              }
            }
          }
          RETURN {
            node
          }
        }
      `;

      expectEqual({ received: dgql, expected });

      expect(params).toEqual({});
    });
  });

  describe("edge", () => {
    test("should project an edge node", () => {
      const builder = new Builder();

      const [dgql, params] = builder
        .match({
          node: node({ label: "Node" }).project({
            id: property(),
            nodes: edge({
              type: "HAS_NODE",
              direction: "OUT",
              node: node({ label: "Node" }),
            }).project({ id: property() }),
          }),
        })
        .return(["node"])
        .build();

      const expected = gql`
        {
          MATCH {
            node @node(label: Node) {
              PROJECT {
                id
                nodes @edge(type: HAS_NODE, direction: OUT) @node(label: Node) {
                  id
                }
              }
            }
          }
          RETURN {
            node
          }
        }
      `;

      expectEqual({ received: dgql, expected });

      expect(params).toEqual({});
    });

    test("should project an edge node with where", () => {
      const builder = new Builder();

      const [dgql, params] = builder
        .match({
          node: node({ label: "Node" }).project({
            id: property(),
            nodes: edge({
              type: "HAS_NODE",
              direction: "OUT",
              node: node({ label: "Node" }).where({
                id: property({ equal: "id" }),
              }),
            }).project({ id: property() }),
          }),
        })
        .return(["node"])
        .build();

      const expected = gql`
        {
          MATCH {
            node @node(label: Node) {
              PROJECT {
                id
                nodes
                  @edge(type: HAS_NODE, direction: OUT)
                  @node(label: Node)
                  @where(id: $match_node_nodes_where_id) {
                  id
                }
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
        match_node_nodes_where_id: "id",
      });
    });
  });
});
