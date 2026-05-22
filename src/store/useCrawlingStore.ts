import create from 'zustand';
import { ShareResponse } from '../services/instagramService';

export type CrawlingStatus = 'idle' | 'submitting' | 'polling' | 'done' | 'error';

interface CrawlingState {
  status: CrawlingStatus;
  jobId: string | null;
  result: ShareResponse | null;
  errorMsg: string;
  /** 증가할 때마다 이전 콜백을 무효화 (cancel 용) */
  generation: number;

  setSubmitting: () => void;
  startPolling: (jobId: string) => void;
  setDone: (result: ShareResponse) => void;
  setError: (msg: string) => void;
  dismiss: () => void;
  reset: () => void;
}

const useCrawlingStore = create<CrawlingState>((set) => ({
  status: 'idle',
  jobId: null,
  result: null,
  errorMsg: '',
  generation: 0,

  setSubmitting: () =>
    set({ status: 'submitting', jobId: null, result: null, errorMsg: '' }),

  startPolling: (jobId) =>
    set({ status: 'polling', jobId }),

  setDone: (result) =>
    set({ status: 'done', result, jobId: null }),

  setError: (msg) =>
    set({ status: 'error', errorMsg: msg, jobId: null }),

  dismiss: () =>
    set({ status: 'idle', result: null, errorMsg: '' }),

  reset: () =>
    set((s) => ({
      status: 'idle',
      jobId: null,
      result: null,
      errorMsg: '',
      generation: s.generation + 1,
    })),
}));

export default useCrawlingStore;
