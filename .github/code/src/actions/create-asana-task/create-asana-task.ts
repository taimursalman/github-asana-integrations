import * as core from '@actions/core';
import { Client } from 'asana';
import { getWorkspaceGid, findAsanaUserByEmail } from '@Components/create-asana-task/create-asana-task-library';
import { AsanaTaskResponse } from '@/src/components/create-asana-task/create-asana-task.types';

interface TaskData {
    name: string;
    notes: string;
    projects: string[];
    workspace: string;
    assignee?: string;
}

export const createAsanaTask = async () => {
    try {
        const token = core.getInput('token');
        const title = core.getInput('title');
        const notes = core.getInput('notes') || '';
        const projectId = core.getInput('projectId');
        const assigneeEmail = core.getInput('assignee-email');
        const githubUser = core.getInput('github-user');


        
        // Log inputs for debugging
        core.info(`Title: ${title}`);
        core.info(`ProjectId: ${projectId}`);
        core.info(`Notes: ${notes}`);
        core.info(`Assignee Email: ${assigneeEmail}`);
        core.info(`GitHub User: ${githubUser}`);
        
        // Configure Asana client
        // TODO: Uncomment this when we have a way to use the SDK
        const client = Client.create();
        client.useAccessToken(token);

        const workspaceGid = await getWorkspaceGid(token);
        core.info(`Workspace GID: ${workspaceGid}`);

        const taskData: TaskData = {
            name: title,
            notes: notes,
            projects: [projectId],
            workspace: workspaceGid
        };

        // Find assignee if email provided
        if (assigneeEmail) {
            const assignee = await findAsanaUserByEmail(assigneeEmail, token, workspaceGid);
            if (assignee) {
                taskData.assignee = assignee.gid;
                core.info(`Found Asana user: ${assignee.name} (${assignee.email})`);
            } else {
                core.warning(`Could not find Asana user with email: ${assigneeEmail}`);
            }
        }



        // TODO: Uncomment this when we have a way to use the SDK
        // // 2. Create task using the SDK
        // const taskResponse = await client.tasks.create(taskData);
        
        // core.info(`✅ Created task: ${taskResponse.gid}`);
        // core.setOutput("task_id", taskResponse.gid);

         // 2. Create task
         const taskResp = await fetch('https://app.asana.com/api/1.0/tasks', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: taskData })
        });

        if (!taskResp.ok) {
            const errorData = await taskResp.json();
            throw new Error(`Failed to create task: ${JSON.stringify(errorData)}`);
        }

        const taskResponse = await taskResp.json() as AsanaTaskResponse;
        core.info(`✅ Created task: ${taskResponse.data.gid}`);
        core.setOutput("taskId", taskResponse.data.gid);

    } catch (error) {
        const message = (error as Error)?.message || String(error);
        core.setFailed(`❌ Failed to create Asana task: ${message}`);
    }
}
