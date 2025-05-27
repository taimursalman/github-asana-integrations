import * as core from '@actions/core';
import * as asana from 'asana';
import { getWorkspaceGid, findAsanaUserByEmail } from '@Components/create-asana-task/create-asana-task-library';

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
        const client = asana.Client.create();
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

        // 2. Create task using the SDK
        const taskResponse = await client.tasks.create(taskData);
        
        core.info(`✅ Created task: ${taskResponse.gid}`);
        core.setOutput("task_id", taskResponse.gid);

    } catch (error) {
        const message = (error as Error)?.message || String(error);
        core.setFailed(`❌ Failed to create Asana task: ${message}`);
    }
}
