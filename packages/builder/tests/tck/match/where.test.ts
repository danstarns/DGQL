import { Builder, node, property } from "../../../src";
import { parse, print } from "graphql";

describe("match/where", () => {
    test("should match a node with where", () => {
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

        expect(print(parse(dgql))).toEqual(
            print(
                parse(`
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
                `)
            )
        );

        expect(params).toEqual({
            match_node_id_equal: id,
        });
    });
});
