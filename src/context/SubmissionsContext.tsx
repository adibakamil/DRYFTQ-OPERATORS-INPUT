import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as service from '../services/submissions';
import type { CreateSubmissionInput } from '../services/submissions';
import type { SubmissionRecord, SubmissionStatus } from '../types';

interface SubmissionsContextValue {
  records: SubmissionRecord[];
  loading: boolean;
  create: (input: CreateSubmissionInput) => Promise<SubmissionRecord>;
  setStatus: (id: string, status: SubmissionStatus, note?: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SubmissionsContext = createContext<SubmissionsContextValue | null>(null);

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setRecords(await service.listSubmissions());
  }, []);

  useEffect(() => {
    service.seedDemoData();
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const create = useCallback(async (input: CreateSubmissionInput) => {
    const record = await service.createSubmission(input);
    await refresh();
    return record;
  }, [refresh]);

  const setStatus = useCallback(
    async (id: string, status: SubmissionStatus, note?: string) => {
      await service.updateSubmissionStatus(id, status, note);
      await refresh();
    },
    [refresh],
  );

  const clearAll = useCallback(async () => {
    await service.clearSubmissions();
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ records, loading, create, setStatus, clearAll, refresh }),
    [records, loading, create, setStatus, clearAll, refresh],
  );

  return <SubmissionsContext.Provider value={value}>{children}</SubmissionsContext.Provider>;
}

export function useSubmissions(): SubmissionsContextValue {
  const context = useContext(SubmissionsContext);
  if (!context) throw new Error('useSubmissions must be used inside SubmissionsProvider');
  return context;
}
