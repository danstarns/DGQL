export interface EdgeProjectInput {
    [k: string]: unknown;
}

export interface EdgeInput {
    type: string;
    direction: "IN" | "OUT";
}
