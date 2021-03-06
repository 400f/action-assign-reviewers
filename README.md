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
```

## Development

```sh
$ yarn build && yarn package
```

このリポジトリでプルリク作ったらワークフロー走るからそこでテストする。
