/**
 * CrawlingPoller
 * null-render 컴포넌트 — 앱 루트에 마운트되어 인스타 크롤링 job을 백그라운드에서 폴링한다.
 * 완료/에러 시 useCrawlingStore 상태를 업데이트 → HomeScreen 배너로 사용자에게 알림.
 */
import { useEffect } from 'react';
import useCrawlingStore from '../../store/useCrawlingStore';
import instagramService from '../../services/instagramService';

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_COUNT = 20; // 20 × 3s = 60s

export default function CrawlingPoller() {
  const status = useCrawlingStore((s) => s.status);
  const jobId = useCrawlingStore((s) => s.jobId);
  const setDone = useCrawlingStore((s) => s.setDone);
  const setError = useCrawlingStore((s) => s.setError);

  useEffect(() => {
    if (status !== 'polling' || !jobId) return;

    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let count = 0;

    const poll = async () => {
      if (!active) return;

      count++;
      if (count > MAX_POLL_COUNT) {
        if (active) setError('분석 시간이 초과되었습니다 (60초). 다시 시도해주세요.');
        return;
      }

      try {
        const job = await instagramService.getJobStatus(jobId);
        if (!active) return;

        if (job.status === 'done') {
          setDone(job);
          return;
        }
        if (job.status === 'error' || job.error) {
          setError(job.error ?? '분석 중 오류가 발생했습니다.');
          return;
        }
      } catch (e: unknown) {
        const err = e as { response?: { status?: number } };
        if (err?.response?.status === 404) {
          setError('작업을 찾을 수 없습니다. 다시 시도해주세요.');
          return;
        }
        // 일시적 네트워크 오류 → 재시도
      }

      if (active) {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    timer = setTimeout(poll, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [status, jobId]);

  return null;
}
