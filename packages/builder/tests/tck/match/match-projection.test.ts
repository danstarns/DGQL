import { Builder, node, property } from "../../../src";
import { parse, print } from "graphql";

describe("match/projection", () => {
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

        expect(print(parse(dgql))).toEqual(
            print(
                parse(`
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
                `)
            )
        );

        expect(params).toEqual({});
    });
});
