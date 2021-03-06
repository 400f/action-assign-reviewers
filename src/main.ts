import * as core from '@actions/core'
import github from '@actions/github'

const ctx = github.context

async function run(): Promise<void> {
  try {
    const token = core.getInput('GITHUB_TOKEN', {required: true})
    const reviewers = core.getInput('REVIEWERS').split(',')
    const teamReviewers = core.getInput('TEAM_REVIEWERS').split(',')

    const octokit = github.getOctokit(token, {})

    if (!ctx.payload.pull_request?.number) return
    const {data: pullRequest} = await octokit.pulls.get({
      owner: ctx.repo.owner,
      repo: ctx.repo.repo,
      pull_number: ctx.payload.pull_request.number
    })

    const requestedReviewersNum = pullRequest.requested_reviewers?.length ?? 0
    if (requestedReviewersNum > 0) return

    await octokit.pulls.requestReviewers({
      owner: ctx.repo.owner,
      repo: ctx.repo.repo,
      pull_number: ctx.payload.pull_request.number,
      reviewers,
      team_reviewers: teamReviewers
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
