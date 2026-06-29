import { create } from "zustand";

interface BookState {
  dentist: { id: number; name: string };
  date: Date | undefined;
  startTime: string | null;
  service: { id: number; priority: number; name: string } | null;
}

interface BookAction {
  setDentist: (dentist: { id: number; name: string }) => void;
  setDate: (date: Date | undefined) => void;
  setStartTime: (startTime: string | null) => void;
  setService: (service: { id: number; priority: number; name: string }) => void;
}

export const useBook = create<BookState & BookAction>((set) => ({
  dentist: { id: 0, name: "" },
  date: undefined,
  startTime: null,
  service: null,
  setDentist: (dentist) => set(() => ({ dentist })),
  setDate: (date) => set(() => ({ date })),
  setStartTime: (startTime) => set(() => ({ startTime })),
  setService: (service) => set(() => ({ service })),
}));
