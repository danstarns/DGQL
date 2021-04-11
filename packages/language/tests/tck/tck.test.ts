import path from "path";
import { describe, expect } from "@jest/globals";
import {
  generateTestCasesFromMd,
  Test,
  TestCase,
} from "./utils/generate-test-cases-from-md.utils";
import trimmer from "./utils/trimmer";
import { translate } from "../../src";

const TCK_DIR = path.join(__dirname, "tck-test-files");

describe("TCK Generated tests", () => {
  const testCases: TestCase[] = generateTestCasesFromMd(TCK_DIR);

  testCases.forEach(({ tests, file }) => {
    describe(file, () => {
      test.each(tests.map((t) => [t.name, t as Test]))("%s", async (_, obj) => {
        const test = obj as Test;

        const translation = translate({
          query: test.query as string,
        });

        expect(trimmer(translation.cypher)).toEqual(
          trimmer(test.cypher as string)
        );
        expect(translation.params).toEqual(test.params);
      });
    });
  });
});
