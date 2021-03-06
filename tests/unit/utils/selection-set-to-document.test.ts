import { selectionSetToDocument, removeLoc } from "../../../src/utils";
import { parse, print } from "graphql";

describe("selectionSetToDocument", () => {
    test("should return document on string input", () => {
        const selectionSet = `
            {
                match {
                    node @node(label: "Node") {
                        id
                    }
                }
            }
        `;

        const result = selectionSetToDocument(selectionSet);

        expect(result).toEqual(parse(selectionSet));
    });

    test("should return document on document input", () => {
        const selectionSet = `
            {
                match {
                    node @node(label: "Node") {
                        id
                    }
                }
            }
        `;

        const doc = removeLoc(parse(print(parse(selectionSet))));

        const result = selectionSetToDocument(doc);

        expect(removeLoc(result)).toEqual(doc);
    });
});
