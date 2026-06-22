"use client";
import { api } from "~/trpc/react";
import { authClient } from "~/server/better-auth/client";
import { useState, useEffect } from "react";
import { Pie, PieChart, Bar, BarChart, Line, LineChart } from "recharts";

const SERVICES = [
  {
    id: 1,
    title: "General Cleaning",
    description:
      "Routine clinical check-ups, digital X-rays, deep cleanings, and protective fillings to maintain optimal long-term oral hygiene.",
    completionTime: "1 hour",
  },
  {
    id: 2,
    title: "Root Canal",
    description:
      "Specialized micro-treatments to eliminate internal tooth infections, relieve persistent throbbing pain, and save the natural tooth from extraction.",
    completionTime: "1 hour 30 mins",
  },
  {
    id: 3,
    title: "Wisdom Tooth Removal",
    description:
      "Advanced surgical removal of damaged, decayed, or deeply trapped impacted wisdom teeth to prevent gum infections and protect neighboring teeth.",
    completionTime: "2 hours",
  },
  {
    id: 4,
    title: "Dentures",
    description:
      "Premium custom-fitted full or partial dental prosthetics designed to restore natural speech, chewing function, and a complete smile after tooth loss.",
    completionTime: "2 hours 30 mins",
  },
];

export default function AdminPage() {
  const [serviceDistribution, setServiceDistribution] = useState<
    { label: string; value: number }[] | null
  >([]);
  const [appsByDentist, setAppsByDentist] = useState<
    { label: string; value: number }[] | null
  >([]);
  const [hourlyTraffic, setHourlyTraffic] = useState<
    { label: string; value: number }[] | null
  >([]);

  function getServiceDistributionData(appointments: any[]) {
    // Map service IDs to human-readable names
    const counts: Record<string, number> = SERVICES.reduce(
      (acc, service) => {
        acc[service.title] = 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    appointments.forEach((app) => {
      const name = SERVICES[app.service]?.title || `Service ${app.service}`;
      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts).map(([label, value]) => ({
      label,
      value,
    }));
  }
  // Output format: [{ label: "General Dentistry", value: 5 }, ...]

  function getAppsByDentist(appointments: any[]) {
    const dentistNames: Record<number, string> = {
      1: "Dr. Amina Omondi",
      2: "Dr. Faraj Patel",
      3: "Dr. Chloe Mwangi",
    };

    // Initialize a structure for our dentists
    const graphMap: Record<string, any> = {};

    appointments.forEach((app) => {
      const dentistName =
        dentistNames[app.dentistId] || `Dentist ${app.dentistId}`;

      if (!graphMap[dentistName]) {
        graphMap[dentistName] = {
          name: dentistName,
          "General Dentistry": 0,
          "Root Canal Therapy": 0,
          "Surgical Extractions": 0,
          Dentures: 0,
        };
      }

      // Increment based on the service type
      if (app.service === 1) graphMap[dentistName]["General Dentistry"]++;
      else if (app.service === 2) graphMap[dentistName]["Root Canal Therapy"]++;
      else if (app.service === 3)
        graphMap[dentistName]["Surgical Extractions"]++;
      else if (app.service === 4) graphMap[dentistName]["Dentures"]++;
    });

    return Object.values(graphMap);
  }
  /* Output format:
     [{ name: "Dr. Faraj Patel", "General Dentistry": 0, "Root Canal Therapy": 4, ... }]
  */

  function getHourlyTraffic(appointments: any[]) {
    const hourlyCounts: Record<string, number> = {};

    appointments.forEach((app) => {
      // Extracts the hour block (e.g., "08:00", "09:30" becomes "08:00 AM", "09:00 AM")
      const dateObj = new Date(app.startTime);
      let hour = dateObj.getUTCHours();

      // Fallback parser if your startTime string isn't fully ISO formatted
      if (isNaN(hour) && typeof app.startTime === "string") {
        const match = app.startTime.match(/T(\d{2}):/);
        hour = match ? parseInt(match[1], 10) : 0;
      }

      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const timeLabel = `${displayHour}:00 ${ampm}`;

      hourlyCounts[timeLabel] = (hourlyCounts[timeLabel] || 0) + 1;
    });
    // Sort logically by operational clinic hour brackets
    const timeOrder = [
      "8:00 AM",
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
    ];

    return timeOrder.map((time) => ({
      time,
      appointments: hourlyCounts[time] || 0,
    }));
  }
  // Output format: [{ time: "8:00 AM", appointments: 3 }, ...]

  const { data: session } = authClient.useSession();
  const {
    data: apps,
    isLoading: appsLoading,
    isError: appsError,
  } = api.apps.getAll.useQuery();

  useEffect(() => {
    if (apps) {
      setServiceDistribution(getServiceDistributionData(apps));
      setAppsByDentist(getAppsByDentist(apps));
      setHourlyTraffic(getHourlyTraffic(apps));
    }
  }, [apps, appsLoading, appsError]);

  return (
    <div>
      <h1>Welcome back, {session?.user?.name}</h1>
      <p className="text-muted-foreground">
        View all statistics and reports generated by the system.
      </p>

      <div>
        {hourlyTraffic && (
          <LineChart data={hourlyTraffic}>
            <Line type="monotone" dataKey="appointments" stroke="#8884d8" />
          </LineChart>
        )}
        {serviceDistribution && (
          <BarChart data={serviceDistribution}>
            <Bar dataKey="appointments" fill="#8884d8" />
          </BarChart>
        )}
        {appsByDentist && (
          <PieChart data={appsByDentist}>
            <Pie dataKey="appointments" fill="#8884d8" />
          </PieChart>
        )}
      </div>
    </div>
  );
}
