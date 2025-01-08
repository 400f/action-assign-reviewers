import * as core from '@actions/core'
import * as github from '@actions/github'

const ctx = github.context

const getInputAsArray = (name: string): string[] =>
  core.getInput(name) === '' ? [] : core.getInput(name).split(',')

async function run(): Promise<void> {
  try {
    const token = core.getInput('GITHUB_TOKEN', { required: true })
    const reviewers = getInputAsArray('REVIEWERS')
    const teamReviewers = getInputAsArray('TEAM_REVIEWERS')
    const mustReviewers = getInputAsArray('MUST_REVIEWERS')
    const mustTeamReviewers = getInputAsArray('MUST_TEAM_REVIEWERS')

    const octokit = github.getOctokit(token)

    const owner = ctx.repo.owner
    const repo = ctx.repo.repo
    const pull_number = ctx.payload.pull_request?.number
    const author = ctx.payload.pull_request?.user?.login

    if (!pull_number || !author) return

    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
    })

    // PRがドラフトだったらなにもしない
    if (pullRequest.draft) return

    const requestedReviewersNum = pullRequest.requested_reviewers?.length ?? 0

    // PR作成者を除外する
    const filteredMustReviewers = mustReviewers.filter(
      reviewer => reviewer !== author
    )
    const filteredReviewers = reviewers.filter(reviewer => reviewer !== author)

    const additionalReviewers =
      requestedReviewersNum > 0
        ? filteredMustReviewers
        : [...filteredReviewers, ...filteredMustReviewers]

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
