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

  test("should create and return many node", () => {
    const builder = new Builder();

    const [dgql, params] = builder
      .create({
        node1: node({ label: "Node" }),
        node2: node({ label: "Node" }),
      })
      .return(["node1", "node2"])
      .build();

    expect(print(parse(dgql))).toEqual(
      print(
        parse(`
            {
                CREATE {
                    node1 @node(label: Node)
                    node2 @node(label: Node)
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

  test("should create and return many node (many create)", () => {
    const builder = new Builder();

    const [dgql, params] = builder
      .create({
        node1: node({ label: "Node" }),
      })
      .create({
        node2: node({ label: "Node" }),
      })
      .return(["node1", "node2"])
      .build();

    expect(print(parse(dgql))).toEqual(
      print(
        parse(`
            {
                CREATE {
                    node1 @node(label: Node)
                }
                CREATE {
                    node2 @node(label: Node)
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
