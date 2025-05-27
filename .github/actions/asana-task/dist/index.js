/******/ var __webpack_modules__ = ({

/***/ 190:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 486:
/***/ ((module) => {

module.exports = eval("require")("node-fetch");


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(190);
/* harmony import */ var node_fetch__WEBPACK_IMPORTED_MODULE_1__ = __nccwpck_require__(486);



async function findAsanaUserByEmail(email, token, workspaceId) {
  try {
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)(`Searching for Asana user with email: ${email}`);

    const response = await node_fetch__WEBPACK_IMPORTED_MODULE_1__(`https://app.asana.com/api/1.0/users?workspace=${workspaceId}&opt_fields=name,email`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (data.errors) {
      (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.warning)(`Asana API error: ${JSON.stringify(data.errors)}`);
      return null;
    }

    // Find user by email
    const user = data.data.find(user => user.email === email);

    if (user) {
      (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)(`Found user: ${user.name} (${user.email})`);
      return user;
    } else {
      (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)(`No user found with email: ${email}`);
      return null;
    }

  } catch (error) {
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.warning)(`Failed to search for user with email ${email}: ${error.message}`);
    return null;
  }
}

async function getWorkspaceGid(token) {
  const meResp = await node_fetch__WEBPACK_IMPORTED_MODULE_1__('https://app.asana.com/api/1.0/users/me', {
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
    const token = (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)('token');
    const title = (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)('title');
    const notes = (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)('notes') || '';
    const projectId = (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)('projectId');
    const assigneeEmail = (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)('assignee-email');
    const githubUser = (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)('github-user');

    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)(`Token: ${token}`);
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)(`Title: ${title}`);
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)(`ProjectId: ${projectId}`);
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)(`Notes: ${notes}`);
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)(`Assignee Email: ${assigneeEmail}`);
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)(`GitHub User: ${githubUser}`);

    // 1. Get workspace GID by fetching user info (me)
    const workspaceGid = await getWorkspaceGid(token);
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)('Workspace GID:', workspaceGid);

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
        (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)(`Found Asana user: ${assignee.name} (${assignee.email})`);
      } else {
        (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.warning)(`Could not find Asana user with email: ${assigneeEmail}`);
      }
    }

    if (assigneeId) {
      requestData.assignee = assigneeId;
    }

    // 2. Create task
    const taskResp = await node_fetch__WEBPACK_IMPORTED_MODULE_1__('https://app.asana.com/api/1.0/tasks', {
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
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.info)(`✅ Created task: ${taskData.data.gid}`);
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.setOutput)("taskId", taskData.data.gid);

  } catch (error) {
    const message = error?.message || error;
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.setFailed)(`❌ Failed to create Asana task: ${message}`);
  }
}

run();


