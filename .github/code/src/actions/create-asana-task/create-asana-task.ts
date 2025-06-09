import * as core from '@actions/core';
import { getWorkspaceGid, findAsanaUserByEmail } from '@Components/create-asana-task/create-asana-task-library';
import { AsanaTaskResponse } from '@/src/components/create-asana-task/create-asana-task.types';
import * as github from '@actions/github';
import * as cache from '@actions/cache';

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
        // const client = Client.create();
        // core.info(' client created');
        // core.info(String(client))

        // client.useAccessToken(token);

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
                taskData.assignee = assignee.gid
                core.info(`Found Asana user: ${assignee.name} (${assignee.email})`);
            } else {
                core.warning(`Could not find Asana user with email: ${assigneeEmail}`);
            }
        }



        // TODO: Uncomment this when we have a way to use the SDK
        // // 2. Create task using the SDK
        // let a = await client.tasks.create(taskData);
        // core.info(`✅ Created task: ${a.gid}`);

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
        const taskId = taskResponse.data.gid;

        core.info(`✅ Created task: ${taskId}`);



        // Store task ID in GitHub cache (private)
        const pullRequestNumber = github.context.payload.pull_request?.number;
        if (!pullRequestNumber) {
            core.info('No pull request number found')
            //add logic to return here
            return;
        }
        const cacheKey = `asana-task-${pullRequestNumber}`;
        const fs = require('fs');
        fs.writeFileSync('task-id-cache', taskId);

        try {
            await cache.saveCache(['task-id-cache'], cacheKey);
            core.info(`Task ID stored in cache with key: ${cacheKey}`);
        } catch (error) {
            core.info(`Cache save warning: ${error}`);

            // Fallback: use GitHub API to store in PR comment (hidden)
            // const octokit = github.getOctokit(core.getInput('github-token') || process.env.GITHUB_TOKEN);
            // await octokit.rest.issues.createComment({
            //     owner: github.context.repo.owner,
            //     repo: github.context.repo.repo,
            //     issue_number: pullRequestNumber,
            //     body: `<!-- ASANA_TASK_ID:${taskId} -->`
            // });
            // core.info('Task ID stored in hidden PR comment as fallback');
        }

        // Set output
        core.setOutput('task-id', taskId);

    } catch (error) {
        const message = (error as Error)?.message || String(error);
        core.setFailed(`❌ Failed to create Asana task: ${message}`);
    }
}
