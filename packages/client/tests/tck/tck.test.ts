import path from "path";
import { describe, expect } from "@jest/globals";
import {
    generateTestCasesFromMd,
    Test,
    TestCase,
} from "./utils/generate-test-cases-from-md.utils";
import trimmer from "./utils/trimmer";
import { Client } from "../../src";

const TCK_DIR = path.join(__dirname, "tck-test-files");

describe("TCK Generated tests", () => {
    const testCases: TestCase[] = generateTestCasesFromMd(TCK_DIR);

    testCases.forEach(({ tests, file }) => {
        describe(file, () => {
            const client = new Client({
                // @ts-ignore
                driver: {},
            });

            test.each(tests.map((t) => [t.name, t as Test]))(
                "%s",
                async (_, obj) => {
                    const test = obj as Test;

                    const translate = client.translate({
                        query: test.query as string,
                    });

                    expect(trimmer(translate.cypher)).toEqual(
                        trimmer(test.cypher as string)
                    );
                    expect(translate.params).toEqual(test.params);
                }
            );
        });
    });
});
