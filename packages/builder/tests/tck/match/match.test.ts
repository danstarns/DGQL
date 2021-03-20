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
});
