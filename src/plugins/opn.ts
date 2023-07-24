import { Context, Schema } from 'koishi';
import { Octokit } from '@octokit/core';

export const name = 'opn';

export interface Config {
  auth: string;
  owner: string;
  repo: string;
  workflow_id: string;
  ref: string;
}

export const Config: Schema<Config> = Schema.object({
  auth: Schema.string(),
  owner: Schema.string(),
  repo: Schema.string(),
  workflow_id: Schema.string(),
  ref: Schema.string(),
});

export function apply(ctx: Context, { auth, owner, repo, workflow_id, ref }: Config) {
  const octokit = new Octokit({ auth });

  ctx
    .command('opn', { hidden: true, authority: 2 })
    .shortcut('光学笔记更新')
    .action(async () => {
      await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
        owner,
        repo,
        workflow_id,
        ref,
      });
      return '已提交更新';
    });
}
