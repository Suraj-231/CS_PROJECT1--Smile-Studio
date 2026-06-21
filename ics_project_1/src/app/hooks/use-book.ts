import { create } from "zustand";

interface BookState {
  dentistId: number;
  date: string;
  startTime: string;
  serviceType: number;
}

interface BookAction {
  setDentistId: (dentistId: number) => void;
  setDate: (date: string) => void;
  setStartTime: (startTime: string) => void;
  setServiceType: (serviceType: number) => void;
  submitBooking: (data: BookState) => void;
}

export const useBook = create<BookState & BookAction>((set) => ({
  dentistId: 0,
  date: "",
  startTime: "",
  serviceType: 0,
  setDentistId: (dentistId) => set(() => ({ dentistId })),
  setDate: (date) => set(() => ({ date })),
  setStartTime: (startTime) => set(() => ({ startTime })),
  setServiceType: (serviceType) => set(() => ({ serviceType })),
  submitBooking: (data: BookState) => {
    console.log("Booking submitted:", data);
  },
}));
