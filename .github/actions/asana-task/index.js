const core = require('@actions/core');
const fetch = require('node-fetch');

(async () => {
  try {
    const token = core.getInput('token');
    const title = core.getInput('title');
    const notes = core.getInput('notes') || '';
    const projectId = core.getInput('projectId');

    core.info('Token:', token ? '***' : 'missing');
    core.info('Title:', title);
    core.info('ProjectId:', projectId);
    core.info('Notes:', notes);


    // 1. Get workspace GID by fetching user info (me)
    const meResp = await fetch('https://app.asana.com/api/1.0/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!meResp.ok) {
      throw new Error(`Failed to fetch user info: ${meResp.statusText}`);
    }
    const meData = await meResp.json();
    const workspaceGid = meData.data.workspaces[0].gid;

    core.info('Workspace GID:', workspaceGid);

    // 2. Create task
    const taskResp = await fetch('https://app.asana.com/api/1.0/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          name: title,
          notes,
          projects: [projectId],
          workspace: workspaceGid
        }
      })
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
})();
