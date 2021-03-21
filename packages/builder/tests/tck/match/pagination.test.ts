import { Builder, node } from "../../../src";
import { parse, print } from "graphql";

describe("match/pagination", () => {
    describe("limit", () => {
        test("should match and limit a node", () => {
            const builder = new Builder();

            const [dgql, params] = builder
                .match({
                    node: node({ label: "Node" }).pagination({ limit: 10 }),
                })
                .return(["node"])
                .build();

            expect(print(parse(dgql))).toEqual(
                print(
                    parse(`
                        {
                            MATCH {
                                node @node(label: Node) @pagination(limit: 10)
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

    describe("skip", () => {
        test("should match and skip a node", () => {
            const builder = new Builder();

            const [dgql, params] = builder
                .match({
                    node: node({ label: "Node" }).pagination({ skip: 10 }),
                })
                .return(["node"])
                .build();

            expect(print(parse(dgql))).toEqual(
                print(
                    parse(`
                        {
                            MATCH {
                                node @node(label: Node) @pagination(skip: 10)
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
});
