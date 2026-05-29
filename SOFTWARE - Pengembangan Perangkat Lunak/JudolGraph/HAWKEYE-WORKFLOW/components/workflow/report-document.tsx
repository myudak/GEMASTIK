import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ReportDocumentData } from "@/lib/workflow-data";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#1f1f1f",
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    color: "#666666",
    marginBottom: 20,
  },
  section: {
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    marginBottom: 12,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },
  row: {
    borderTop: "1px solid #eeeeee",
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    marginTop: 8,
  },
  label: {
    color: "#666666",
    width: 110,
  },
  value: {
    flex: 1,
  },
  badge: {
    backgroundColor: "#fce8e6",
    borderRadius: 999,
    color: "#b42318",
    fontWeight: 700,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 74,
  },
  listItem: {
    marginBottom: 5,
  },
});

export function HawkeyeReportDocument({ data }: { data: ReportDocumentData }) {
  return (
    <Document title={data.title}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.subtitle}>Dibuat: {data.generatedAt} - Data sintetis demo</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan Eksekutif</Text>
          <Text>{data.executiveSummary}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Kasus</Text>
            <Text style={styles.value}>{data.summary.caseName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Seed</Text>
            <Text style={styles.value}>{data.summary.seed}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Skor Risiko</Text>
            <Text style={styles.badge}>{data.summary.riskScore}/100</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lampiran Bukti</Text>
          {data.evidence.map((item) => (
            <Text key={item.label} style={styles.listItem}>
              - {item.label}: {item.description}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Signals</Text>
          {data.riskSignals.map((item) => (
            <Text key={item.label} style={styles.listItem}>
              - {item.label}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audit Trail</Text>
          {data.auditTrail.map((item) => (
            <Text key={item} style={styles.listItem}>
              - {item}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}
