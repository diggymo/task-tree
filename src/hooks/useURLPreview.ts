import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { URLPreviewData, URLPreviewState } from '../types/urlPreview';
import { parseSlackURL } from '../utils/urlDetection';

interface SlackMessageResponse {
  user: string;
  text: string;
  ts: string;
}

export function useURLPreview(url: string | null, type: string) {
  const [state, setState] = useState<URLPreviewState>({
    loading: false,
    data: null,
    error: null
  });

  const fetchSlackMessage = useCallback(async (url: string): Promise<URLPreviewData | null> => {
    const parts = parseSlackURL(url);
    if (!parts) {
      throw new Error('Invalid Slack URL');
    }

    const response = await invoke<SlackMessageResponse>('fetch_slack_message', {
      channelId: parts.channelId,
      timestamp: parts.timestamp
    });

    return {
      type: 'slack',
      user: response.user,
      text: response.text,
      timestamp: response.ts,
      teamDomain: parts.workspace
    };
  }, []);

  const fetchPreview = useCallback(async (url: string, type: string) => {
    setState({ loading: true, data: null, error: null });

    try {
      let data: URLPreviewData | null = null;

      if (type === 'slack') {
        data = await fetchSlackMessage(url);
      }
      // 将来的に他のサービスをここに追加
      // else if (type === 'github') { ... }
      // else if (type === 'jira') { ... }

      if (data) {
        setState({ loading: false, data, error: null });
      } else {
        setState({ loading: false, data: null, error: 'Unsupported URL type' });
      }
    } catch (error) {
      console.error('Failed to fetch URL preview:', error);
      setState({
        loading: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [fetchSlackMessage]);

  useEffect(() => {
    if (url && type !== 'unknown') {
      fetchPreview(url, type);
    } else {
      setState({ loading: false, data: null, error: null });
    }
  }, [url, type, fetchPreview]);

  return state;
}
