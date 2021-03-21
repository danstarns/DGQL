export interface EdgeProjectInput {
    [k: string]: unknown;
}

export type SortDirection = "DESC" | "ASC";

export type EdgeDirection = "IN" | "OUT";
export interface EdgeInput {
    type: string;
    direction: EdgeDirection;
}
