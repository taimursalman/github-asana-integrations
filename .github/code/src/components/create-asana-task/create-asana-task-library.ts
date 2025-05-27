import { info, warning } from '@actions/core';
import fetch from 'node-fetch';
import { AsanaMeResponse, AsanaUser, AsanaUserResponse } from './create-asana-task.types';

export const findAsanaUserByEmail = async (email: string, token: string, workspaceId: string): Promise<AsanaUser | null> => {
    try {
        info(`Searching for Asana user with email: ${email}`);

        const response = await fetch(`https://app.asana.com/api/1.0/users?workspace=${workspaceId}&opt_fields=name,email`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const data = await response.json() as AsanaUserResponse;

        if (data.errors) {
            warning(`Asana API error: ${JSON.stringify(data.errors)}`);
            return null;
        }

        // Find user by email
        const user = data.data.find(user => user.email === email);

        if (user) {
            info(`Found user: ${user.name} (${user.email})`);
            return user;
        } else {
            info(`No user found with email: ${email}`);
            return null;
        }

    } catch (error) {
        warning(`Failed to search for user with email ${email}: ${(error as Error).message}`);
        return null;
    }
}

export const getWorkspaceGid = async (token: string): Promise<string> => {
    const meResp = await fetch('https://app.asana.com/api/1.0/users/me', {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!meResp.ok) {
        throw new Error(`Failed to fetch user info: ${meResp.statusText}`);
    }
    const meData = await meResp.json() as AsanaMeResponse;
    const workspaceGid = meData.data.workspaces[0].gid;
    return workspaceGid;
}