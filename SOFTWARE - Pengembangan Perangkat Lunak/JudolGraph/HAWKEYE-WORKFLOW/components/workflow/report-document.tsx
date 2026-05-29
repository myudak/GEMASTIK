import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ReportDocumentData } from "@/lib/workflow-data";

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#fce8e6",
    borderRadius: 999,
    color: "#b42318",
    fontWeight: 700,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 74,
  },
  label: {
    color: "#666666",
    width: 112,
  },
  listItem: {
    marginBottom: 5,
  },
  page: {
    backgroundColor: "#ffffff",
    color: "#1f1f1f",
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 36,
  },
  row: {
    borderTop: "1px solid #eeeeee",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
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
  subtitle: {
    color: "#666666",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  value: {
    flex: 1,
  },
  warning: {
    color: "#b45309",
    marginTop: 8,
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
            <Text style={styles.value}>{data.case.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Seed</Text>
            <Text style={styles.value}>{data.case.seed}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Skor Risiko</Text>
            <Text style={styles.badge}>{data.case.riskScore}/100</Text>
          </View>
          {data.pendingReviewCount > 0 ? (
            <Text style={styles.warning}>
              {data.pendingReviewCount} bukti masih Need Review dan tidak masuk lampiran final.
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lampiran Bukti Verified</Text>
          {data.evidence.map((item) => (
            <Text key={item.id} style={styles.listItem}>
              - {item.title}: {item.description} Hash {item.hash.slice(0, 16)}...
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entitas Verified</Text>
          {data.entities.map((item) => (
            <Text key={item.id} style={styles.listItem}>
              - {item.type}: {item.value} ({item.confidence}%)
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Scoring</Text>
          {data.riskSignals.map((item) => (
            <Text key={item.id} style={styles.listItem}>
              - {item.label}: bobot {item.weight}, confidence {Math.round(item.confidence * 100)}%
            </Text>
          ))}
          <Text style={styles.warning}>{data.graphSummary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audit Trail</Text>
          {data.auditTrail.map((item) => (
            <Text key={item.id} style={styles.listItem}>
              - {item.at} - {item.action}: {item.detail}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}
