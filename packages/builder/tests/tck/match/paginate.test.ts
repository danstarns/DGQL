import gql from "graphql-tag";
import { Builder, node, property } from "../../../src";
import { expectEqual } from "../../utils";

describe("match/paginate", () => {
  describe("limit", () => {
    test("should match and limit a node", () => {
      const builder = new Builder();

      const [dgql, params] = builder
        .match({
          node: node({ label: "Node" }).paginate({ limit: 10 }),
        })
        .return(["node"])
        .build();

      const expected = gql`
        {
          MATCH {
            node @node(label: Node) @paginate(limit: 10)
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

  describe("skip", () => {
    test("should match and skip a node", () => {
      const builder = new Builder();

      const [dgql, params] = builder
        .match({
          node: node({ label: "Node" }).paginate({ skip: 10 }),
        })
        .return(["node"])
        .build();

      const expected = gql`
        {
          MATCH {
            node @node(label: Node) @paginate(skip: 10)
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

  describe("sort", () => {
    test("should sort node", () => {
      const builder = new Builder();

      const [dgql, params] = builder
        .match({
          node: node({ label: "Node" }).paginate({
            sort: { id: property({ direction: "DESC" }) },
          }),
        })
        .return(["node"])
        .build();

      const expected = gql`
        {
          MATCH {
            node @node(label: Node) {
              SORT {
                id(direction: DESC)
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
});
