import * as core from '@actions/core';
import fetch from 'node-fetch';
import { findAsanaUserByEmail, getWorkspaceGid } from './components/create-asana-task/create-asana-task-library';
import { AsanaTaskData, AsanaTaskResponse } from './components/create-asana-task/create-asana-task.types';


async function run(): Promise<void> {
  try {
    const token = core.getInput('token');
    const title = core.getInput('title');
    const notes = core.getInput('notes') || '';
    const projectId = core.getInput('projectId');
    const assigneeEmail = core.getInput('assignee-email');
    const githubUser = core.getInput('github-user');

    core.info(`Token: ${token}`);
    core.info(`Title: ${title}`);
    core.info(`ProjectId: ${projectId}`);
    core.info(`Notes: ${notes}`);
    core.info(`Assignee Email: ${assigneeEmail}`);
    core.info(`GitHub User: ${githubUser}`);

    // 1. Get workspace GID by fetching user info (me)
    const workspaceGid = await getWorkspaceGid(token);
    core.info(`Workspace GID: ${workspaceGid}`);

    const requestData: AsanaTaskData = {
      name: title,
      notes,
      projects: [projectId],
      workspace: workspaceGid
    };

    // Find assignee if email provided
    let assigneeId: string | null = null;
    if (assigneeEmail) {
      const assignee = await findAsanaUserByEmail(assigneeEmail, token, workspaceGid);
      if (assignee) {
        assigneeId = assignee.gid;
        core.info(`Found Asana user: ${assignee.name} (${assignee.email})`);
      } else {
        core.warning(`Could not find Asana user with email: ${assigneeEmail}`);
      }
    }

    if (assigneeId) {
      requestData.assignee = assigneeId;
    }

    // 2. Create task
    const taskResp = await fetch('https://app.asana.com/api/1.0/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: requestData })
    });

    if (!taskResp.ok) {
      const errorData = await taskResp.json();
      throw new Error(`Failed to create task: ${JSON.stringify(errorData)}`);
    }

    const taskData = await taskResp.json() as AsanaTaskResponse;
    core.info(`✅ Created task: ${taskData.data.gid}`);
    core.setOutput("taskId", taskData.data.gid);

  } catch (error) {
    const message = (error as Error)?.message || String(error);
    core.setFailed(`❌ Failed to create Asana task: ${message}`);
  }
}

run();

