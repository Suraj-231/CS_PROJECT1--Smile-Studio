import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register default clean Helvetica styles for vector-precise PDF tracking
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://cdn.jsdelivr.net/astro-fonts/helvetica.ttf", fontWeight: "normal" },
    { src: "https://cdn.jsdelivr.net/astro-fonts/helvetica-bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff", // Pure crisp white page canvas
    fontFamily: "Helvetica",
  },
  
  // Clean Balanced Header Block
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 10,
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#69d2cb", // Your signature brand tone
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 10,
    color: "#64748b", // Slate muted gray text
    marginTop: 3,
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  dateHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#69d2cb",
  },
  
  // Crisp Solid Divider Line 
  headerDivider: {
    height: 1.5,
    backgroundColor: "#69d2cb",
    marginTop: 8,
    marginBottom: 24,
  },

  // Section Descriptors
  tableSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#334155", // Deep Slate
    marginTop: 16,
    marginBottom: 4,
  },
  tableSectionDescription: {
    fontSize: 9,
    color: "#64748b", // Slate subtitle text
    marginBottom: 10,
  },

  // Flat Minimalist Table Component Layout
  tableWrapper: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 24,
  },
  tableHeaderRow: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f8fafc", // Light clean row separation header tint
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableDataRow: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  tableDataRowLast: {
    display: "flex",
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  
  // Flexible Column Width Anchors
  thText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569", // Dark Slate
    textTransform: "uppercase",
  },
  tdText: {
    fontSize: 10,
    color: "#334155", // Primary readable body Slate
  },
  colLong: {
    flex: 2,
  },
  colShort: {
    flex: 1,
    textAlign: "right",
  },

  // Bottom Fixed Footer Page Counters
  footerText: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
});

interface SmileStudioPDFReportProps {
  trafficData: { timeSlot: string; appointments: number|undefined }[];
  dentistData: { dentist: string; appointments: number }[];
  serviceData: { service: string; volume: number }[];
  userData: { id: string; name: string; email: string; totalVisits: number }[];
  selectedMonthName: string; // e.g., "July"
  selectedYear: number;       // e.g., 2026
}

export function SmileStudioPDFReport({
  trafficData = [],
  dentistData = [],
  serviceData = [],
  userData = [],
  selectedMonthName = new Date().toLocaleString("default", { month: "long" }),
  selectedYear = new Date().getFullYear(),
}: SmileStudioPDFReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* ================= HEADER SEGMENT ================= */}
        <View style={styles.headerContainer} fixed>
          <View style={styles.headerLeft}>
            <Text style={styles.mainTitle}>Smile Studio Report</Text>
            <Text style={styles.subTitle}>summaries generated from the system</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.dateHeading}>{`${selectedMonthName} ${selectedYear}`}</Text>
          </View>
        </View>

        {/* Brand Accent Divider Border Line */}
        <View style={styles.headerDivider} fixed />


        {/* ================= CLINICAL TREATMENT PERFORMANCE TABLE ================= */}
        <View>
          <Text style={styles.tableSectionTitle}>Treatment Allocations</Text>
          <Text style={styles.tableSectionDescription}>
            Volumetric share metrics mapping the distribution density of completed dental service categories.
          </Text>
          
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thText, styles.colLong]}>Dental Treatment Service Type</Text>
              <Text style={[styles.thText, styles.colShort]}>Volume Share</Text>
            </View>
            {serviceData.map((item, idx) => (
              <View 
                key={item.service} 
                style={idx === serviceData.length - 1 ? styles.tableDataRowLast : styles.tableDataRow}
              >
                <Text style={[styles.tdText, styles.colLong]}>{item.service}</Text>
                <Text style={[styles.tdText, styles.colShort, { fontWeight: "bold" }]}>{item.volume} Units</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ================= NEW: TRAFFIC DATA CHRONOLOGICAL DISTRIBUTION ================= */}
        <View>
          <Text style={styles.tableSectionTitle}>Peak Operational Traffic</Text>
          <Text style={styles.tableSectionDescription}>
            Hourly appointment distribution windows highlighting the clinic's busiest operational slots.
          </Text>
          
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thText, styles.colLong]}>Time Interval Block</Text>
              <Text style={[styles.thText, styles.colShort]}>Appointment Count</Text>
            </View>
            {trafficData.map((item, idx) => (
              <View 
                key={item.timeSlot} 
                style={idx === trafficData.length - 1 ? styles.tableDataRowLast : styles.tableDataRow}
              >
                <Text style={[styles.tdText, styles.colLong]}>Interval Session: {item.timeSlot}</Text>
                <Text style={[styles.tdText, styles.colShort, { fontWeight: "bold" }]}>{item.appointments} Cases</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ================= PRACTITIONER WORKLOAD MATRIX TABLE ================= */}
        <View>
          <Text style={styles.tableSectionTitle}>Specialist Case Operations</Text>
          <Text style={styles.tableSectionDescription}>
            Operational load configurations indicating individual medical case loads assigned per dentist.
          </Text>
          
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thText, styles.colLong]}>Medical Practitioner Name</Text>
              <Text style={[styles.thText, styles.colShort]}>Allocated Cases</Text>
            </View>
            {dentistData.map((item, idx) => (
              <View 
                key={item.dentist} 
                style={idx === dentistData.length - 1 ? styles.tableDataRowLast : styles.tableDataRow}
              >
                <Text style={[styles.tdText, styles.colLong]}>{item.dentist}</Text>
                <Text style={[styles.tdText, styles.colShort, { fontWeight: "bold" }]}>{item.appointments} Bookings</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ================= COMPREHENSIVE USER DATA REGISTRY TABLE ================= */}
        <View break>
          <Text style={styles.tableSectionTitle}>Active Patient Registry Metrics</Text>
          <Text style={styles.tableSectionDescription}>
            Detailed administrative log summarizing user system metrics, secure email endpoints, and engagement records.
          </Text>
          
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thText, { width: "80px" }]}>Patient ID</Text>
              <Text style={[styles.thText, { flex: 1 }]}>Full Name & Account Address</Text>
              <Text style={[styles.thText, { width: "70px", textAlign: "right" }]}>Total Visits</Text>
            </View>
            {userData.map((user, idx) => (
              <View 
                key={user.id} 
                style={idx === userData.length - 1 ? styles.tableDataRowLast : styles.tableDataRow}
              >
                <Text style={[styles.tdText, { width: "80px", color: "#64748b", fontSize: 9 }]}>{user.id}</Text>
                <View style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Text style={[styles.tdText, { fontWeight: "bold" }]}>{user.name}</Text>
                  <Text style={{ fontSize: 8, color: "#64748b", marginTop: 1 }}>{user.email}</Text>
                </View>
                <Text style={[styles.tdText, { width: "70px", textAlign: "right" }]}>{user.totalVisits} sessions</Text>
              </View>
            ))}
          </View>
        </View>

        

        {/* Dynamic Safe Footer Tracker */}
        <Text 
          style={styles.footerText} 
          render={({ pageNumber, totalPages }) => `Smile Studio Executive Intelligence • Page ${pageNumber} of ${totalPages}`} 
          fixed 
        />
        
      </Page>
    </Document>
  );
}