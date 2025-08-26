import { info, warning } from '@actions/core';
import fetch from 'node-fetch';
import { AsanaTaskSearchResponse, AsanaTaskResponse } from '../create-asana-task/create-asana-task.types';

export const findAsanaTaskByPrUrl = async (prUrl: string, token: string, projectId: string): Promise<string | null> => {
    try {
        info(`Searching for Asana task with PR URL: ${prUrl}`);

        // Search for tasks in the project that contain the PR URL in their notes
        const response = await fetch(`https://app.asana.com/api/1.0/tasks/search?project=${projectId}&opt_fields=gid,name,notes`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            warning(`Failed to search tasks: ${response.statusText}`);
            return null;
        }

        const data = await response.json() as AsanaTaskSearchResponse;

        // Find task that contains the PR URL in its notes
        const task = data.data.find(task =>
            task.notes && task.notes.includes(prUrl)
        );

        if (task) {
            info(`Found task: ${task.name} (${task.gid})`);
            return task.gid;
        } else {
            info(`No task found with PR URL: ${prUrl}`);
            return null;
        }

    } catch (error) {
        warning(`Failed to search for task with PR URL ${prUrl}: ${(error as Error).message}`);
        return null;
    }
};

export const assignAsanaTask = async (taskId: string, assigneeGid: string, token: string): Promise<boolean> => {
    try {
        info(`Assigning task ${taskId} to user ${assigneeGid}`);

        const response = await fetch(`https://app.asana.com/api/1.0/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    assignee: assigneeGid
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            warning(`Failed to assign task: ${JSON.stringify(errorData)}`);
            return false;
        }

        const taskResponse = await response.json() as AsanaTaskResponse;
        info(`✅ Task assigned successfully: ${taskResponse.data.name}`);
        return true;

    } catch (error) {
        warning(`Failed to assign task ${taskId}: ${(error as Error).message}`);
        return false;
    }
};
