import { create } from "zustand";

interface BookState {
  dentist: { id: number; name: string } | null;
  date: Date | undefined;
  startTime: string | null;
  serviceType: { id: number; title: string } | null;
}

interface BookAction {
  setDentist: (dentist: { id: number; name: string } | null) => void;
  setDate: (date: Date | undefined) => void;
  setStartTime: (startTime: string | null) => void;
  setServiceType: (serviceType: { id: number; title: string }) => void;
  submitBooking: (data: BookState) => void;
}

export const useBook = create<BookState & BookAction>((set) => ({
  dentist: null,
  date: undefined,
  startTime: null,
  serviceType: null,
  setDentist: (dentist) => set(() => ({ dentist })),
  setDate: (date) => set(() => ({ date })),
  setStartTime: (startTime) => set(() => ({ startTime })),
  setServiceType: (serviceType) => set(() => ({ serviceType })),
  submitBooking: (data: BookState) => {
    console.log("Booking submitted:", data);
  },
}));
