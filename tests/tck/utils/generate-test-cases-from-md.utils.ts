import fs from "fs";
import path from "path";

type Params = {
    [key: string]: unknown;
};

export type Test = {
    name: string;
    selectionSet?: string;
    selectionSetParams?: Params;
    cypherQuery?: string;
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
                return [
                    ...res,
                    ...generateTestCasesFromMd(path.join(dir, item.name)),
                ];
            }

            return res;
        }, []) as TestCase[];

    return files;
}

const nameRe = /###(?<capture>([^\n]+))/;
const selectionSetRe = /```graphql(?<capture>(.|\s)*?)```/;
const selectionSetParamsRe = /```selection-params(?<capture>(.|\s)*?)```/;
const cypherQueryRe = /```cypher(?<capture>(.|\s)*?)```/;

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

                const selectionSet = captureOrEmptyString(t, selectionSetRe);
                const selectionSetParams = JSON.parse(
                    captureOrEmptyString(t, selectionSetParamsRe) || "{}"
                ) as Params;
                const cypherQuery = captureOrEmptyString(t, cypherQueryRe);

                return {
                    name,
                    selectionSet,
                    selectionSetParams,
                    cypherQuery,
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
