export interface AsanaUser {
    gid: string;
    name: string;
    email: string;
}

export interface AsanaUserResponse {
    data: AsanaUser[];
    errors?: any[];
}

export interface AsanaMeResponse {
    data: {
        gid: string;
        workspaces: Array<{
            gid: string;
            name: string;
        }>;
    };
}

export interface AsanaTaskResponse {
    data: {
        gid: string;
        name: string;
        assignee?: AsanaUser;
        projects: Array<{
            gid: string;
            name: string;
        }>;
    };
}

export interface AsanaTaskSearchResponse {
    data: Array<{
        gid: string;
        name: string;
        assignee?: AsanaUser;
        notes?: string;
    }>;
}
