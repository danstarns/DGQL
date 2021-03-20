import { Builder, node } from "../../../src";
import { lexicographicSortSchema, parse, print } from "graphql";

describe("match", () => {
    test("should match and return a node", () => {
        const builder = new Builder();

        const [dgql, params] = builder
            .match({
                node: node({ label: "Node" }),
            })
            .return(["node"])
            .build();

        expect(print(parse(dgql))).toEqual(
            print(
                parse(`
                    {
                        MATCH {
                            node @node(label: Node)
                        }
                        RETURN {
                            node
                        }
                    }
                `)
            )
        );

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

        expect(print(parse(dgql))).toEqual(
            print(
                parse(`
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
                `)
            )
        );

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

        expect(print(parse(dgql))).toEqual(
            print(
                parse(`
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
                `)
            )
        );

        expect(params).toEqual({});
    });
});
