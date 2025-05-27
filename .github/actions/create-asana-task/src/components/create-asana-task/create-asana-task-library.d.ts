import { AsanaUser } from './create-asana-task.types';
export declare const findAsanaUserByEmail: (email: string, token: string, workspaceId: string) => Promise<AsanaUser | null>;
export declare const getWorkspaceGid: (token: string) => Promise<string>;
//# sourceMappingURL=create-asana-task-library.d.ts.map