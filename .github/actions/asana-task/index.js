const core = require('@actions/core');
const fetch = require('node-fetch');

async function findAsanaUserByEmail(email, token, workspaceId) {
  try {
    core.info(`Searching for Asana user with email: ${email}`);

    const response = await fetch(`https://app.asana.com/api/1.0/users?workspace=${workspaceId}&opt_fields=name,email`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (data.errors) {
      core.warning(`Asana API error: ${JSON.stringify(data.errors)}`);
      return null;
    }

    // Find user by email
    const user = data.data.find(user => user.email === email);

    if (user) {
      core.info(`Found user: ${user.name} (${user.email})`);
      return user;
    } else {
      core.info(`No user found with email: ${email}`);
      return null;
    }

  } catch (error) {
    core.warning(`Failed to search for user with email ${email}: ${error.message}`);
    return null;
  }
}

async function getWorkspaceGid(token) {
  const meResp = await fetch('https://app.asana.com/api/1.0/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!meResp.ok) {
    throw new Error(`Failed to fetch user info: ${meResp.statusText}`);
  }
  const meData = await meResp.json();
  const workspaceGid = meData.data.workspaces[0].gid;
  return workspaceGid;
}


async function run() {
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
    core.info('Workspace GID:', workspaceGid);

    const requestData = {
      name: title,
      notes,
      projects: [projectId],
      workspace: workspaceGid
    }

    // Find assignee if email provided
    let assigneeId = null;
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
      taskData.assignee = assigneeId;
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

    const taskData = await taskResp.json();
    core.info(`✅ Created task: ${taskData.data.gid}`);
    core.setOutput("taskId", taskData.data.gid);

  } catch (error) {
    const message = error?.message || error;
    core.setFailed(`❌ Failed to create Asana task: ${message}`);
  }
}

run();

