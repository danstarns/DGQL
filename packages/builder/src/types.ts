export interface NodeInput {
    label?: string;
}

export interface NodeProjectInput {
    [k: string]: unknown;
}

export interface EdgeProjectInput {
    [k: string]: unknown;
}

export interface EdgeInput {
    type: string;
    direction: "IN" | "OUT";
}
