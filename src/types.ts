import type { PostgrestClient } from "@supabase/postgrest-js";

export interface PostgrestAdapterOptions {
    schema?: string;
    executorFunction?: string;
}

export interface PostgrestFilter {
    col: string;
    val: any;
    op: "eq" | "in";
}

export interface PostgrestRpcParams {
    target_schema: string;
    target_table: string;
    op_type: "select" | "insert" | "update" | "delete";
    filters?: PostgrestFilter[];
    payload?: Record<string, any>;
}

