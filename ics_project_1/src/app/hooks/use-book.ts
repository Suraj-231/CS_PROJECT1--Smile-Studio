import { create } from "zustand";
import { api } from "~/trpc/react";

interface BookState {
  dentist: { id: number; name: string } | null;
  date: Date | null;
  startTime: string | null;
  serviceType: { id: number; name: string } | null;
}

interface BookAction {
  setDentist: (dentist: { id: number; name: string } | null) => void;
  setDate: (date: Date | null) => void;
  setStartTime: (startTime: string | null) => void;
  setServiceType: (serviceType: { id: number; name: string }) => void;
  submitBooking: (data: BookState) => void;
}

export const useBook = create<BookState & BookAction>((set) => ({
  dentist: null,
  date: null,
  startTime: null,
  serviceType: null,
  setDentist: (dentist) => set(() => ({ dentist })),
  setDate: (date) => set(() => ({ date })),
  setStartTime: (startTime) => set(() => ({ startTime })),
  setServiceType: (serviceType) => set(() => ({ serviceType })),
  submitBooking: async (data) => {
    const createApp = api.apps.create.useMutation();
    const { dentist, date, startTime, serviceType } = data;
    try {
      if (!dentist || !date || !startTime || !serviceType) return;
      const dateString = date.toISOString();
      await createApp.mutateAsync({
        dentistId: dentist.id,
        date: dateString,
        startTime,
        serviceType: serviceType.id,
      });
    } catch (error) {
      console.error("Failed to submit booking:", error);
    } finally {
      set(() => ({
        dentist: null,
        date: null,
        startTime: null,
        serviceType: null,
      }));
    }
  },
}));
