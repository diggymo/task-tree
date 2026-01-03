import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { parseGitHubPRURL } from '../utils/urlDetection';
import type { GitHubPullRequestPreview } from '../types/urlPreview';

interface GitHubUser {
  login: string;
  avatarUrl: string;
}

interface GitHubPRResponse {
  title: string;
  number: number;
  state: string;
  isDraft: boolean;
  author: GitHubUser;
  assignees: GitHubUser[];
  createdAt: string;
  url: string;
}

export function useGitHubPR() {
  const fetchGitHubPR = useCallback(async (url: string): Promise<GitHubPullRequestPreview> => {
    const parts = parseGitHubPRURL(url);
    if (!parts) {
      throw new Error('Invalid GitHub PR URL');
    }

    const response = await invoke<GitHubPRResponse>('fetch_github_pr', {
      owner: parts.owner,
      repo: parts.repo,
      number: parts.number
    });

    // stateを小文字に変換してタイプセーフに
    let state: 'open' | 'closed' | 'merged' = 'open';
    const stateUpper = response.state.toUpperCase();
    if (stateUpper === 'MERGED') {
      state = 'merged';
    } else if (stateUpper === 'CLOSED') {
      state = 'closed';
    } else if (stateUpper === 'OPEN') {
      state = 'open';
    }

    return {
      type: 'github',
      title: response.title,
      number: response.number,
      state,
      isDraft: response.isDraft,
      user: {
        login: response.author.login,
        avatar_url: response.author.avatarUrl
      },
      assignee: response.assignees.length > 0 ? {
        login: response.assignees[0].login,
        avatar_url: response.assignees[0].avatarUrl
      } : null,
      created_at: response.createdAt,
      repository: `${parts.owner}/${parts.repo}`,
      url: response.url
    };
  }, []);

  return { fetchGitHubPR };
}
