# Github action assign reviewers

A Github action workflow that assign reviewers and team reviewers.

## Usage

```yml
name: auto assign reviewers

on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  auto-assign-reviewer:
    runs-on: ubuntu-latest
    steps:
      - name: Run assignment of reviewer team
        uses: 400f/action-assign-reviewers@main
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          REVIEWERS: 'RyoNkmr,YosukeCSato'
          TEAM_REVIEWERS: 'employee-eng,scrum-dev'
          # PR作成時にReviewersを設定していても、MUST_REVIEWERS, MUST_TEAM_REVIEWERSは必ず追加される
          MUST_REVIEWERS: 'hoge,fuga'
          MUST_TEAM_REVIEWERS: 'team-a,team-b'
```

## Development

### Build

```sh
# Install dependencies
yarn install

# Lint check
yarn lint

# Compile TypeScript
yarn build

# Bundle for distribution
yarn package
```

### Local Verification

You can verify the action works locally by running with mock environment variables:

```sh
# Create mock PR event
cat > /tmp/mock_event.json << 'EOF'
{
  "pull_request": {
    "number": 999,
    "user": { "login": "test-author" },
    "draft": false
  },
  "repository": {
    "owner": { "login": "400f" },
    "name": "action-assign-reviewers"
  }
}
EOF

# Run with mock environment
INPUT_GITHUB_TOKEN="test-token" \
INPUT_REVIEWERS="user1,user2" \
INPUT_MUST_REVIEWERS="must-user" \
GITHUB_REPOSITORY="400f/action-assign-reviewers" \
GITHUB_EVENT_NAME="pull_request" \
GITHUB_EVENT_PATH="/tmp/mock_event.json" \
node dist/index.js
```

Expected output: `::error::Bad credentials` (indicates the action reached the GitHub API call step - authentication fails because of the test token, but the action logic works correctly)

### Integration Test

Create a pull request in this repository to trigger the test workflow (`.github/workflows/test.yml`).
