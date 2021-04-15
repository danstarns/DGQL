import fs from "fs";
import path from "path";

type Params = {
  [key: string]: unknown;
};

export type Test = {
  name: string;
  query?: string;
  queryParams?: Params;
  params?: Params;
  cypher?: string;
};

export type TestCase = {
  tests: Test[];
  file: string;
};

export function generateTestCasesFromMd(dir: string): TestCase[] {
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .reduce((res: TestCase[], item) => {
      if (item.isFile()) {
        return [...res, generateTests(path.join(dir, item.name))];
      }

      if (item.isDirectory()) {
        return [...res, ...generateTestCasesFromMd(path.join(dir, item.name))];
      }

      return res;
    }, []) as TestCase[];

  return files;
}

const nameRe = /###(?<capture>([^\n]+))/;
const queryRe = /```graphql(?<capture>(.|\s)*?)```/;
const queryParamsRe = /```graphql-params(?<capture>(.|\s)*?)```/;
const paramsRe = /```params(?<capture>(.|\s)*?)```/;
const cypherRe = /```cypher(?<capture>(.|\s)*?)```/;

function generateTests(filePath: string): TestCase {
  const data = fs.readFileSync(filePath, { encoding: "utf8" });
  const file = path.basename(filePath);

  const out: TestCase = {
    tests: extractTests(data.toString()),
    file,
  };

  return out;
}

function extractTests(contents: string): Test[] {
  const testParts = contents.split("---").slice(1);
  const generatedTests = testParts.map((t) => t.trim());

  return generatedTests
    .map(
      (t): Test => {
        const name = captureOrEmptyString(t, nameRe).trim();
        if (!name) {
          return {} as Test;
        }

        const query = captureOrEmptyString(t, queryRe);
        const queryParams = JSON.parse(
          captureOrEmptyString(t, queryParamsRe) || "{}"
        ) as Params;
        const params = JSON.parse(
          captureOrEmptyString(t, paramsRe) || "{}"
        ) as Params;
        const cypher = captureOrEmptyString(t, cypherRe);

        return {
          name,
          query,
          queryParams,
          params,
          cypher,
        };
      }
    )
    .filter((t) => t.name);
}

function captureOrEmptyString(contents: string, re: RegExp): string {
  const m = contents.match(re);
  if (m?.groups?.capture) {
    return m.groups.capture.trim();
  }
  return "";
}
