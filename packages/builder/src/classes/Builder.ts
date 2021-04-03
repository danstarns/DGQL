import createDGQLAndParams from "../create-dgql-and-params";
import type { MatchInput, CreateInput, Operation } from "../types";

class Builder {
  operations: Operation[];
  returnInput?: string[];

  constructor() {
    this.operations = [];
  }

  match(input: MatchInput): Builder {
    this.operations.push({ kind: "MATCH", input });
    return this;
  }

  create(input: CreateInput): Builder {
    this.operations.push({ kind: "CREATE", input });
    return this;
  }

  return(input: string[]): Builder {
    this.returnInput = input;

    return this;
  }

  build(): [string, Record<string, unknown>] {
    return createDGQLAndParams({
      operations: this.operations,
      returnStrings: this.returnInput || [],
    });
  }
}

export default Builder;
