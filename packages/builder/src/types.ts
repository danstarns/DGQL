import type { Node } from "./classes";

export type SortDirection = "DESC" | "ASC";

export type EdgeDirection = "IN" | "OUT";

export interface MatchInput {
  [k: string]: Node;
}

export interface CreateInput {
  [k: string]: Node;
}

export interface Match {
  order: number;
  input: MatchInput;
}

export interface Create {
  order: number;
  input: CreateInput;
}

export type Operation =
  | {
      kind: "CREATE";
      input: CreateInput;
    }
  | {
      kind: "MATCH";
      input: MatchInput;
    };
