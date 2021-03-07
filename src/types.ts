import { DocumentNode, FieldNode } from "graphql";

export type Query = string | DocumentNode;

export type ReturnVariables = {
    MATCH: string[];
};

export type Translation = {
    cypher: string;
    params: Record<string, unknown>;
    returnVariables: ReturnVariables;
};

export type Direction = "IN" | "OUT";
