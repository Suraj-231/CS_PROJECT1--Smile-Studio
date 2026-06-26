const TIMES = [
  { value: "08:30:00", label: "08:30 AM" },
  { value: "09:00:00", label: "09:00 AM" },
  { value: "09:30:00", label: "09:30 AM" },
  { value: "10:00:00", label: "10:00 AM" },
  { value: "10:30:00", label: "10:30 AM" },
  { value: "11:00:00", label: "11:00 AM" },
  { value: "11:30:00", label: "11:30 AM" },
  { value: "12:00:00", label: "12:00 PM" },
  { value: "12:30:00", label: "12:30 PM" },
  { value: "13:00:00", label: "01:00 PM" },
  { value: "13:30:00", label: "01:30 PM" },
  { value: "14:00:00", label: "02:00 PM" },
  { value: "14:30:00", label: "02:30 PM" },
  { value: "15:00:00", label: "03:00 PM" },
  { value: "15:30:00", label: "03:30 PM" },
  { value: "16:00:00", label: "04:00 PM" },
  { value: "16:30:00", label: "04:30 PM" },
  { value: "17:00:00", label: "05:00 PM" },
];

export function getHourlyTraffic(data: any[] | undefined) {
  if (!data) return;
  // Initialize a 24-hour map tracker (or limit this to clinic operational hours like 8-17)
  const trafficMap: Record<string, number> = {};
  TIMES.forEach((slot) => {
    trafficMap[slot.label] = 0;
  });

  // 2. Count the matches based on the appointment's startTime string field
  data.forEach((row) => {
    const rawTime = row.appointments.startTime; // Expecting strings like "09:30:00"

    if (rawTime) {
      // Standardize format: ensure it includes seconds if Postgres cuts it to "HH:MM"
      const cleanTime = rawTime.length === 5 ? `${rawTime}:00` : rawTime;

      // Find the matching slot label from your configuration array
      const matchedSlot = TIMES.find((slot) => slot.value === cleanTime);

      if (matchedSlot) {
        trafficMap[matchedSlot.label] =
          (trafficMap[matchedSlot.label] ?? 0) + 1;
      }
    }
  });

  // 3. Transform the object map into a flat array sorted chronologically for the Shadcn BarChart
  // We map directly over your TIMES array to maintain the exact chronological sequence automatically
  return TIMES.map((slot) => ({
    timeSlot: slot.label,
    appointments: trafficMap[slot.label],
  }));
}

export function getAppsByDentist(data: any[] | undefined) {
  if (!data) return;
  const dentistMap: Record<string, number> = {};

  data.forEach((row) => {
    const dentistName = row.dentist.name || "Unknown Dentist";
    dentistMap[dentistName] = (dentistMap[dentistName] || 0) + 1;
  });

  // Transform into structural array format for Shadcn
  return Object.entries(dentistMap).map(([dentist, count]) => ({
    dentist,
    appointments: count,
  }));
}

export function getServiceDistributionData(data: any[] | undefined) {
  if (!data) return;
  const serviceMap: Record<string, number> = {};

  data.forEach((row) => {
    const serviceName = row.service.name || "Other Treatment";
    serviceMap[serviceName] = (serviceMap[serviceName] || 0) + 1;
  });

  // Shadcn PieCharts look great when you inject fill color config keys dynamically
  return Object.entries(serviceMap).map(([service, count], index) => ({
    service,
    volume: count,
    // Dynamically hooks up to your chart's CSS variable palette theme colors
    fill: `var(--chart-${index + 1})`,
  }));
}
