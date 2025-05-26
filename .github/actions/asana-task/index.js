const core = require('@actions/core');
const asana = require('asana');

(async () => {
  try {
    const token = core.getInput('token');
    const title = core.getInput('title');
    const notes = core.getInput('notes') || '';
    const projectId = core.getInput('projectId');

    const client = asana.Client.create().useAccessToken(token);
    const me = await client.users.me();
    const workspaceGid = me.workspaces[0].gid;

    //test comment 2

    const task = await client.tasks.create({
      name: title,
      notes,
      projects: [projectId],
      workspace: workspaceGid,
    });

    console.log(`✅ Created task: ${task.gid}`);
    core.setOutput("taskId", task.gid);
  } catch (err) {
    const message = errresponse?.data || errmessage || err
    core.setFailed(`❌ Failed to create Asana task: ${JSON.stringify(message, null, 2)}`);

  }
})();
