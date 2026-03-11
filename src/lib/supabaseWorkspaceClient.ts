import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * Helper to ensure queries and mutations are isolated by workspace_id.
 * Supports both 'workspace_id' and legacy 'workspace' column names.
 */
export function withWorkspace<T extends PostgrestFilterBuilder<any, any, any, any>>(
    query: T,
    workspaceId: string | undefined,
    columnName: 'workspace_id' | 'workspace' = 'workspace_id'
): T {
    if (!workspaceId) {
        console.warn(`Query attempted without workspaceId on column ${columnName}`);
        return query;
    }
    return query.eq(columnName, workspaceId) as T;
}

/**
 * Validates that a workspace ID exists before performing a write operation.
 * Throws an error if missing.
 */
export function validateWorkspace(workspaceId: string | undefined): string {
    if (!workspaceId) {
        throw new Error("Multi-tenancy Error: Operation blocked. Missing workspace_id.");
    }
    return workspaceId;
}
