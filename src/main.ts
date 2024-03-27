import * as core from '@actions/core'
import * as github from '@actions/github'

const ctx = github.context

async function run(): Promise<void> {
  try {
    const token = core.getInput('GITHUB_TOKEN', { required: true })
    const reviewers = core.getInput('REVIEWERS').split(',')
    const teamReviewers = core.getInput('TEAM_REVIEWERS').split(',')
    const mustReviewers = core.getInput('MUST_REVIEWERS').split(',')
    const mustTeamReviewers = core.getInput('MUST_TEAM_REVIEWERS').split(',')

    const octokit = github.getOctokit(token)

    const owner = ctx.repo.owner
    const repo = ctx.repo.repo
    const pull_number = ctx.payload.pull_request?.number

    if (!pull_number) return
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
    })

    // PRがドラフトだったらなにもしない
    if (pullRequest.draft) return

    const requestedReviewersNum = pullRequest.requested_reviewers?.length ?? 0

    const additionalReviewers =
      requestedReviewersNum > 0
        ? mustReviewers
        : [...reviewers, ...mustReviewers]

    const additionalTeamReviewers =
      requestedReviewersNum > 0
        ? mustTeamReviewers
        : [...teamReviewers, ...mustTeamReviewers]

    // 追加するべきレビュアーがいない場合はなにもしない
    if (additionalReviewers.length + additionalTeamReviewers.length === 0)
      return

    await octokit.rest.pulls.requestReviewers({
      owner,
      repo,
      pull_number,
      reviewers: additionalReviewers,
      team_reviewers: additionalTeamReviewers,
    })
    /* eslint @typescript-eslint/no-explicit-any: 0 */
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
