import { create } from "zustand";
import { api } from "~/trpc/react";

interface BookState {
  dentist: { id: number; name: string };
  date: Date | undefined;
  startTime: string | null;
  serviceType: { id: number; name: string } | null;
}

interface BookAction {
  setDentist: (dentist: { id: number; name: string }) => void;
  setDate: (date: Date | undefined) => void;
  setStartTime: (startTime: string | null) => void;
  setServiceType: (serviceType: { id: number; name: string }) => void;
}

export const useBook = create<BookState & BookAction>((set) => ({
  dentist: { id: 0, name: "" },
  date: undefined,
  startTime: null,
  serviceType: null,
  setDentist: (dentist) => set(() => ({ dentist })),
  setDate: (date) => set(() => ({ date })),
  setStartTime: (startTime) => set(() => ({ startTime })),
  setServiceType: (serviceType) => set(() => ({ serviceType })),
}));
