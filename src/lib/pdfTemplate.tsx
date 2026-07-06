import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register default fonts for clean rendering weight distributions
Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/astro-fonts/helvetica.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/astro-fonts/helvetica-bold.ttf",
      fontWeight: "bold",
    },
  ],
});

// Explicit react-pdf structural layout tokens
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },

  // Header Blocks
  headerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: "#69d2cb",
    paddingBottom: 12,
    marginBottom: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  headerMeta: {
    fontSize: 9,
    color: "#64748b",
    textAlign: "right",
  },

  // Section Typography
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // KPI High-Density Layout Grid
  kpiRow: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#1c232b", // oklch(0.275 0.011 216.9) Hex conversion
    borderRadius: 8,
    padding: 12,
    display: "flex",
    flexDirection: "column",
  },
  kpiLabel: {
    fontSize: 8,
    color: "#69d2cb", // Primary Accent Color
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },

  // Two-Column Grid Row
  chartGridRow: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    marginBottom: 15,
  },
  chartColumn: {
    flex: 1,
  },

  // Flat Table Lists (Replacing Recharts inside native PDF vector boundaries)
  tableContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 5,
    alignItems: "center",
  },
  tableRowLast: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    alignItems: "center",
  },
  tableLabel: {
    fontSize: 9,
    color: "#334155", // Slate primary text
  },
  tableValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
  },

  // Visual Horizontal Rule Dividers
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },

  // Fixed Bottom Page Numbering Signposts
  footerText: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
  },
});

interface ClinicalSummaryReportProps {
  trafficData: { timeSlot: string; appointments: number | undefined }[];
  dentistData: { dentist: string; appointments: number }[];
  serviceData: { service: string; volume: number }[];

  // Executive Dashboard Placeholder Count Projections
  appointmentCount?: number;
  dentistCount?: number;
  serviceCount?: number;
  userCount?: number;
}

export function ClinicalSummaryReport({
  trafficData = [],
  dentistData = [],
  serviceData = [],
  appointmentCount = 0,
  dentistCount = 0,
  serviceCount = 0,
  userCount = 0,
}: ClinicalSummaryReportProps) {
  // Slice lists safely to guarantee elements don't cause trailing overflow pages
  const primaryTraffic = trafficData.slice(0, 8);
  const topDentists = dentistData.slice(0, 5);
  const primaryServices = serviceData.slice(0, 5);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ================= HEADER SECTION ================= */}
        <View style={styles.headerContainer} fixed>
          <View>
            <Text style={styles.headerTitle}>Clinical Summary Report</Text>
            <Text style={styles.headerSubtitle}>Clinical Summary Report</Text>
          </View>
          <View>
            <Text style={styles.headerMeta}>Generated: June 2026</Text>
            <Text style={styles.headerMeta}>
              Scope: Monthly Analytics Summary
            </Text>
          </View>
        </View>

        {/* ================= 4-COLUMN DATA KPI CARD ROW ================= */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Appointments</Text>
            <Text style={styles.kpiValue}>{appointmentCount}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Patients</Text>
            <Text style={styles.kpiValue}>{userCount}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Dentists</Text>
            <Text style={styles.kpiValue}>{dentistCount}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Services</Text>
            <Text style={styles.kpiValue}>{serviceCount}</Text>
          </View>
        </View>

        {/* ================= LOWER DATA VIEWS (SIDE BY SIDE GRID) ================= */}
        <Text style={styles.sectionTitle}>
          Practitioner Workloads & Services Share
        </Text>
        <View style={styles.chartGridRow}>
          {/* Left Column Component: Dentist Distribution List */}
          <View style={styles.chartColumn}>
            <View style={styles.tableContainer}>
              {topDentists.map((item, idx) => (
                <View
                  key={item.dentist}
                  style={
                    idx === topDentists.length - 1
                      ? styles.tableRowLast
                      : styles.tableRow
                  }
                >
                  <Text style={styles.tableLabel}>{item.dentist}</Text>
                  <Text style={styles.tableValue}>
                    {item.appointments} Appointments
                  </Text>
                </View>
              ))}
              {topDentists.length === 0 && (
                <Text style={styles.tableLabel}>
                  No specialist operations logged.
                </Text>
              )}
            </View>
          </View>

          {/* Right Column Component: Treatment Service Volumetric Share */}
          <View style={styles.chartColumn}>
            <View style={styles.tableContainer}>
              {primaryServices.map((item, idx) => (
                <View
                  key={item.service}
                  style={
                    idx === primaryServices.length - 1
                      ? styles.tableRowLast
                      : styles.tableRow
                  }
                >
                  <Text style={styles.tableLabel}>{item.service}</Text>
                  <Text style={styles.tableValue}>
                    {item.volume} Appointments
                  </Text>
                </View>
              ))}
              {primaryServices.length === 0 && (
                <Text style={styles.tableLabel}>
                  No catalog allocation distributions found.
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ================= CHRONOLOGICAL TRAFFIC DISTRIBUTION ================= */}
        <Text style={styles.sectionTitle}>Hourly Traffic Distribution</Text>
        <View style={styles.tableContainer}>
          {primaryTraffic.map((item, idx) => (
            <View
              key={item.timeSlot}
              style={
                idx === primaryTraffic.length - 1
                  ? styles.tableRowLast
                  : styles.tableRow
              }
            >
              <Text style={styles.tableLabel}>{item.timeSlot}</Text>
              <Text style={styles.tableValue}>
                {item.appointments} Bookings
              </Text>
            </View>
          ))}
          {primaryTraffic.length === 0 && (
            <Text style={styles.tableLabel}>
              No chronological distribution slots tracking.
            </Text>
          )}
        </View>

        {/* ================= FOOTER RUNTIME SIGNPOSTING ================= */}
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
