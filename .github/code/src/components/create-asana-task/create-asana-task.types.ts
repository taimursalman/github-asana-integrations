export interface AsanaUserResponse {
    data: AsanaUser[];
    errors?: Array<{ message: string }>;
}

export interface AsanaUser {
    gid: string;
    name: string;
    email: string;
}

interface AsanaWorkspace {
    gid: string;
}

export interface AsanaMeResponse {
    data: {
        workspaces: AsanaWorkspace[];
    };
}

export interface AsanaTaskData {
    name: string;
    notes: string;
    projects: string[];
    workspace: string;
    assignee?: string;
}

export interface AsanaTaskResponse {
    data: {
        gid: string;
    };
}
