# GitHub-Asana Integration

A comprehensive GitHub Actions integration that automatically creates and assigns Asana tasks based on pull request events.

## Features

- **Automatic Task Creation**: Creates Asana tasks when pull requests are opened
- **Smart Assignment**: Assigns tasks to the appropriate team members based on PR assignments
- **Email-based User Matching**: Matches GitHub users to Asana users via email addresses
- **Flexible Configuration**: Supports custom project IDs and workspace settings

## Actions

### 1. Create Asana Task (`create-asana-task`)

Creates a new Asana task when a pull request is opened.

#### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `token` | Asana Personal Access Token | Yes | - |
| `title` | Task title | Yes | - |
| `notes` | Task notes/description | No | - |
| `projectId` | Asana project GID | Yes | - |
| `assignee-email` | Email of person to assign task to | No | - |
| `github-user` | GitHub username of PR author | No | - |

#### Outputs

| Output | Description |
|--------|-------------|
| `taskId` | The GID of the created task |
| `taskUrl` | The URL of the created task |

### 2. Assign Asana Task (`assign-asana-task`)

Assigns an existing Asana task when a pull request is assigned to someone.

#### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `token` | Asana Personal Access Token | Yes | - |
| `pr-url` | Pull Request URL | Yes | - |
| `projectId` | Asana project GID | Yes | - |
| `assignee-email` | Email of person to assign task to | Yes | - |
| `github-user` | GitHub username of PR assignee | No | - |

#### Outputs

| Output | Description |
|--------|-------------|
| `assigned` | Whether the task was successfully assigned |
| `assignee` | Name of the assigned user |

## Setup

### 1. Prerequisites

- Asana account with appropriate permissions
- GitHub repository with Actions enabled
- Asana Personal Access Token

### 2. Required Secrets

Add these secrets to your GitHub repository:

- `ASANA_ACCESS_TOKEN`: Your Asana Personal Access Token
- `ASANA_PROJECT_ID`: The GID of your Asana project

### 3. Get Your Asana Project ID

1. Go to your Asana project
2. Look at the URL: `https://app.asana.com/0/PROJECT_ID/...`
3. The `PROJECT_ID` is your project GID

### 4. Get Your Asana Access Token

1. Go to Asana → Profile Settings → Apps → Manage Developer Apps
2. Create a new Personal Access Token
3. Copy the token and add it to your GitHub secrets

## Usage

The integration includes two pre-configured workflows:

### Workflow 1: Create Task on PR Open

Automatically creates an Asana task when a pull request is opened.

```yaml
# .github/workflows/pull-request-task.yml
name: Create Asana Task on PR
on:
  pull_request:
    types: [opened, reopened]
# ... (rest of workflow)
```

### Workflow 2: Assign Task on PR Assignment

Automatically assigns the corresponding Asana task when a PR is assigned.

```yaml
# .github/workflows/assign-task-on-pr-assignment.yml
name: Assign Asana Task on PR Assignment
on:
  pull_request:
    types: [assigned]
# ... (rest of workflow)
```

## Custom Workflows

You can create custom workflows using these actions:

```yaml
name: Custom Asana Integration
on:
  pull_request:
    types: [opened]

jobs:
  create-task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Create Asana Task
        uses: ./.github/actions/create-asana-task
        with:
          token: ${{ secrets.ASANA_ACCESS_TOKEN }}
          title: "Review: ${{ github.event.pull_request.title }}"
          notes: |
            Pull Request: ${{ github.event.pull_request.html_url }}
            Author: ${{ github.event.pull_request.user.login }}
            
            ${{ github.event.pull_request.body }}
          projectId: ${{ secrets.ASANA_PROJECT_ID }}
          assignee-email: "reviewer@company.com"
```

## How It Works

1. **Task Creation**: When a PR is opened, the action:
   - Gets the PR author's email from their commits
   - Creates a new Asana task with the PR title and link
   - Assigns the task to the PR author (if found in Asana)

2. **Task Assignment**: When a PR is assigned, the action:
   - Searches for the existing Asana task using the PR URL
   - Finds the assignee in Asana by email
   - Updates the task assignment

3. **User Matching**: The integration matches GitHub users to Asana users by:
   - Getting the email from Git commits
   - Searching Asana workspace users by email
   - Falling back gracefully if no match is found

## Troubleshooting

### Common Issues

1. **Task not created**: Check that `ASANA_ACCESS_TOKEN` and `ASANA_PROJECT_ID` are correctly set
2. **User not found**: Ensure the GitHub user's commit email matches their Asana account email
3. **Permission errors**: Verify the Asana token has access to the specified project

### Debug Information

The actions provide detailed logging. Check the GitHub Actions logs for:
- User email detection
- Asana API responses
- Task creation/assignment status

## Development

### Building the Actions

```bash
cd .github/code
npm install
npm run build:all
```

### Project Structure

```
.github/
├── actions/
│   ├── create-asana-task/
│   │   ├── action.yml
│   │   └── index.js
│   └── assign-asana-task/
│       ├── action.yml
│       └── index.js
├── code/
│   ├── src/
│   │   ├── actions/
│   │   └── components/
│   ├── package.json
│   └── tsconfig.json
└── workflows/
    ├── pull-request-task.yml
    └── assign-task-on-pr-assignment.yml
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Build and test the actions
5. Submit a pull request

## Support

For issues and questions:
1. Check the GitHub Actions logs for error details
2. Verify your Asana token and project permissions
3. Open an issue with reproduction steps
