import * as core from '@actions/core'
import * as github from '@actions/github'

const ctx = github.context

async function run(): Promise<void> {
  try {
    const token = core.getInput('GITHUB_TOKEN', {required: true})
    const reviewers = core.getInput('REVIEWERS').split(',')
    const teamReviewers = core.getInput('TEAM_REVIEWERS').split(',')

    const octokit = github.getOctokit(token)

    const owner = ctx.repo.owner
    const repo = ctx.repo.repo
    const pull_number = ctx.payload.pull_request?.number

    if (!pull_number) return
    const {data: pullRequest} = await octokit.pulls.get({
      owner,
      repo,
      pull_number
    })

    const requestedReviewersNum = pullRequest.requested_reviewers?.length ?? 0
    if (requestedReviewersNum > 0) return

    await octokit.pulls.requestReviewers({
      owner,
      repo,
      pull_number,
      reviewers,
      team_reviewers: teamReviewers
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
