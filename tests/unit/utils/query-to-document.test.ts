import { queryToDocument, removeLoc } from "../../../src/utils";
import { parse, print } from "graphql";

describe("queryToDocument", () => {
    test("should return document on string input", () => {
        const query = `
            {
                MATCH {
                    node @node(label: "Node") {
                        RETURN {
                            id
                        }
                    }
                }
            }
        `;

        const result = queryToDocument(query);

        expect(result).toEqual(parse(query));
    });

    test("should return document on document input", () => {
        const query = `
            {
                MATCH {
                    node @node(label: "Node") {
                        RETURN {
                            id
                        }
                    }
                }
            }
        `;

        const doc = removeLoc(parse(print(parse(query))));

        const result = queryToDocument(doc);

        expect(removeLoc(result)).toEqual(doc);
    });
});
