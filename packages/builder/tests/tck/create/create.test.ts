import { Builder, node } from "../../../src";
import { parse, print } from "graphql";

describe("create", () => {
  test("should create and return a node", () => {
    const builder = new Builder();

    const [dgql, params] = builder
      .create({
        node: node({ label: "Node" }),
      })
      .return(["node"])
      .build();

    expect(print(parse(dgql))).toEqual(
      print(
        parse(`
            {
                CREATE {
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
