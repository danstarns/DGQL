import { ReturnVariables } from "../types";
import * as neo4j from "neo4j-driver";
import serialize from "./serialize";
import deserialize from "./deserialize";

async function execute({
  cypher,
  params,
  returnVariables,
  driver,
  includeStats,
}: {
  cypher: string;
  params: Record<string, unknown>;
  returnVariables: ReturnVariables;
  driver: neo4j.Driver;
  includeStats?: boolean;
}): Promise<any> {
  const session = driver.session({ defaultAccessMode: "WRITE" });

  let result: any;
  try {
    result = await session.writeTransaction((work) =>
      work.run(cypher, serialize(params))
    );
  } finally {
    session.close();
  }

  return returnVariables.reduce(
    (res, name) => {
      return {
        ...res,
        [name]: result.records
          .filter((x) => x.keys.includes(name))
          .map((x) => deserialize(x.toObject()[name])),
      };
    },
    {
      ...(includeStats
        ? { __STATS__: result.summary.updateStatistics._stats }
        : {}),
    }
  );
}

export default execute;
