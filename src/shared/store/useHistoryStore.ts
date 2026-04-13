import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryRecord {
  id: string;
  scenarioKey: string;
  parameters: Record<string, any>;
  completedAt: string;
  isSaved: boolean;
  customName?: string;
}

interface HistoryStore {
  history: HistoryRecord[];
  addHistory: (record: Omit<HistoryRecord, 'id' | 'isSaved' | 'completedAt'> & { isSaved?: boolean }) => void;
  toggleSave: (id: string, customName?: string) => void;
  removeHistory: (id: string) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (record) => set((state) => {
        const newRecord: HistoryRecord = {
          id: crypto.randomUUID(),
          scenarioKey: record.scenarioKey,
          parameters: record.parameters,
          completedAt: new Date().toISOString(),
          isSaved: record.isSaved ?? false,
        };
        if (record.customName !== undefined) {
          newRecord.customName = record.customName;
        }
        return {
          history: [newRecord, ...state.history]
        };
      }),
      toggleSave: (id, customName) => set((state) => ({
        history: state.history.map((record) => {
          if (record.id === id) {
             const nextSaved = typeof customName !== 'undefined' ? true : !record.isSaved;
             const updated: HistoryRecord = { ...record, isSaved: nextSaved };
             if (customName !== undefined) {
               updated.customName = customName;
             }
             return updated;
          }
          return record;
        })
      })),
      removeHistory: (id) => set((state) => ({
        history: state.history.filter((record) => record.id !== id)
      }))
    }),
    {
      name: 'tutola-history-storage',
    }
  )
);
