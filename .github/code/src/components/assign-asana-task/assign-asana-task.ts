import * as core from '@actions/core';
import { getWorkspaceGid, findAsanaUserByEmail } from '@components/create-asana-task/create-asana-task-library';
import { findAsanaTaskByPrUrl, assignAsanaTask } from '@components/assign-asana-task/assign-asana-task-library';

export const assignAsanaTaskAction = async () => {

    try {
        const token = core.getInput('token');
        const prUrl = core.getInput('pr-url');
        const projectId = core.getInput('projectId');
        const assigneeEmail = core.getInput('assignee-email');
        const githubUser = core.getInput('github-user');

        // Log inputs for debugging
        core.info(`PR URL: ${prUrl}`);
        core.info(`Project ID: ${projectId}`);
        core.info(`Assignee Email: ${assigneeEmail}`);
        core.info(`GitHub User: ${githubUser}`);

        if (!assigneeEmail) {
            core.info('No assignee email provided, skipping task assignment');
            return;
        }

        // Get workspace GID
        const workspaceGid = await getWorkspaceGid(token);
        core.info(`Workspace GID: ${workspaceGid}`);

        // Find the Asana task associated with this PR
        const taskId = await findAsanaTaskByPrUrl(prUrl, token, projectId);
        if (!taskId) {
            core.warning(`Could not find Asana task for PR: ${prUrl}`);
            return;
        }

        // Find the assignee in Asana
        const assignee = await findAsanaUserByEmail(assigneeEmail, token, workspaceGid);
        if (!assignee) {
            core.warning(`Could not find Asana user with email: ${assigneeEmail}`);
            return;
        }

        // Assign the task to the user
        const success = await assignAsanaTask(taskId, assignee.gid, token);
        if (success) {
            core.info(`✅ Successfully assigned task to ${assignee.name}`);
            core.setOutput("assigned", "true");
            core.setOutput("assignee", assignee.name);
        } else {
            core.setFailed(`❌ Failed to assign task to ${assignee.name}`);
        }

    } catch (error) {
        const message = (error as Error)?.message || String(error);
        core.setFailed(`❌ Failed to assign Asana task: ${message}`);
    }
};
