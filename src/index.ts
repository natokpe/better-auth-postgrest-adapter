import { createAdapterFactory, type DBAdapterDebugLogOption } from "better-auth/adapters";
import type { PostgrestClient } from "@supabase/postgrest-js";

expost interface PostgrestAdapterConfig {
  /**
	 * Enable debug logs for the adapter
	 *
	 * @default false
	 */
  debugLogs?: DBAdapterDebugLogOption;
   
  /**
	 * Use plural table names
	 *
	 * @default false
	 */
  usePlural?: boolean;
   
  /**
   * Name of PostgreSQL function 
   */
  functionName?: string;
   
  functionSchema?: string;
  
  /**
	 * Whether to execute multiple operations in a transaction.
	 *
	 * set this to `false` and operations will be executed sequentially.
	 * @default false
	 */
  transaction?: boolean | undefined;
}

export const postgrestAdapter = (postgrest: PostgrestClient, config: PostgrestAdapterConfig = {}) => {
  return createAdapterFactory({
    config: {
      adapterId: "postgrest-adapter",
      adapterName: "PostgREST Adapter",
      usePlural: config.usePlural ?? true,
      debugLogs: config.debugLogs ?? false,
      supportsJSON: true,
      supportsDates: true,
      supportsBooleans: true,
      supportsNumericIds: true,
    },
    
    adapter: ({
      options,
      schema,
      debugLog,
      getFieldName,
      getModelName,
      getDefaultModelName,
      getDefaultFieldName,
      getFieldAttributes,
      transformInput,
      transformOutput,
      transformWhereClause,
    }) => {
      // This rpc call is only needed for queries that require a transaction.
      // All other queries like 
      const query = async (params: PostgrestRpcParams) => {
        const { data, error } = await client.rpc(execFunc, params);
        if (error) throw new Error(error.message);
        return data;
      };
    
      return {
        create: async ({ data, model, select }) => {
        },
        update: async ({ model, where, update }) => {
        },
        updateMany: async ({ model, where, update }) => {
        },
        delete: async ({ model, where }) => {
        },
        deleteMany: async ({ model, where }) => {
        },
        findOne: async ({ model, where, select, join }) => {
        },
        findMany: async ({ model, where, limit, sortBy, offset, join }) => {
        },
        count: async ({ model, where }) => {
        },
        options: config,
        createSchema: async ({ tables, file }) => {
        };
      };
    },
  });
}; 
  
  
import { createAdapterFactory } from "better-auth/adapters";
import type { PostgrestClient } from "@supabase/postgrest-js";
import type { PostgrestAdapterOptions, PostgrestRpcParams } from "./types.js";

export const postgrestAdapter = (client: PostgrestClient, options?: PostgrestAdapterOptions) => {
    const execFunc = options?.executorFunction || "better_auth_postgrest_adapter";
    const targetSchema = options?.schema || "public";

    const query = async (params: PostgrestRpcParams) => {
        const { data, error } = await client.rpc(execFunc, params);
        if (error) throw new Error(`PostgREST Adapter Error: ${error.message}`);
        return data;
    };

    // Use the factory to wrap your adapter logic
    return createAdapterFactory(async () => ({
        async create({ model, data }) {
            return await query({
                target_schema: targetSchema,
                target_table: model,
                op_type: "insert",
                payload: data,
            });
        },
        async findOne({ model, where }) {
            const filters = where.map(w => ({ 
                col: w.field, 
                val: w.value, 
                op: (w.operator as any) || "eq" 
            }));
            const results = await query({
                target_schema: targetSchema,
                target_table: model,
                op_type: "select",
                filters,
            });
            return results[0] || null;
        },
        async findMany({ model, where }) {
            const filters = where?.map(w => ({ 
                col: w.field, 
                val: w.value, 
                op: (w.operator as any) || "eq" 
            })) || [];
            return await query({
                target_schema: targetSchema,
                target_table: model,
                op_type: "select",
                filters,
            });
        },
        async update({ model, where, update }) {
            const filters = where.map(w => ({ 
                col: w.field, 
                val: w.value, 
                op: (w.operator as any) || "eq" 
            }));
            return await query({
                target_schema: targetSchema,
                target_table: model,
                op_type: "update",
                filters,
                payload: update,
            });
        },
        async delete({ model, where }) {
            const filters = where.map(w => ({ 
                col: w.field, 
                val: w.value, 
                op: (w.operator as any) || "eq" 
            }));
            await query({
                target_schema: targetSchema,
                target_table: model,
                op_type: "delete",
                filters,
            });
        },
    }));
};

