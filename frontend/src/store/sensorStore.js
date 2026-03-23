import { create } from 'zustand';
export const useSensorStore = create(set => ({
    latest: null,
    setLatest: (latest) => set({ latest })
}));
