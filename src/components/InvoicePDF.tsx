import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 11, fontFamily: "Helvetica" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  col: { flex: 1 },
  title: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  label: { fontWeight: "bold" },
  table: { width: "100%", borderWidth: 1, borderColor: "#000", marginBottom: 10 },
  tableRow: { flexDirection: "row" },
  tableColHeader: { flex: 1, borderWidth: 1, borderColor: "#000", backgroundColor: "#eee", padding: 5 },
  tableCol: { flex: 1, borderWidth: 1, borderColor: "#000", padding: 5 },
  tableCellHeader: { fontWeight: "bold", fontSize: 11 },
  tableCell: { fontSize: 10 },
  terms: { marginTop: 10, fontSize: 9, lineHeight: 1.3, textAlign: "justify" },
  notes: { marginTop: 10, fontSize: 10 },
});

export default function InvoicesPDF({ record }: { record: any }) {
  const fields = record.fields;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Invoice</Text>

        {/* Row 1: Item Name / Invoice Info */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text>
              <Text style={styles.label}>Item: </Text>
              {fields.Item || "N/A"}
            </Text>
          </View>
          <View style={styles.col}>
            <Text>
              <Text style={styles.label}>Invoice #: </Text>
              {fields.InvoiceNumber || "N/A"}
            </Text>
            <Text>
              <Text style={styles.label}>Date: </Text>
              {fields.DateCreated?.split("T")[0] || "N/A"}
            </Text>
          </View>
        </View>

        {/* Row 2: Bill To */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Bill To:</Text>
            <Text>{fields.CustomerName?.join(", ") || "N/A"}</Text>
            <Text>{fields.Address || "N/A"}</Text>
            <Text>{fields.Phone || "N/A"}</Text>
          </View>
          <View style={styles.col}></View>
        </View>

        {/* Row 3: Items Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Description</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>QTY</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Price</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Amount</Text>
            </View>
          </View>

          {/* Data Row (from Airtable) */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{fields.Item || "—"}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>1</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {fields.Price ? `$${fields.Price}` : "—"}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {fields.Price ? `$${fields.Price}` : "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By paying the due balance on invoices provided, the Client hereby
          acknowledges that all requested service items for this date and/or any
          other dates listed above in the description section of the table, have
          been performed and have been tested showing successful satisfactory
          install/repair, unless otherwise stated on the invoice, in which labor
          service charges still apply if any repairs have been made. By
          accepting this invoice, the Client agrees to pay in full the amount
          listed in the Total section of the invoice.
        </Text>

        {/* Notes */}
        <View style={styles.notes}>
          <Text style={styles.label}>Notes:</Text>
          <Text>{fields.Notes || "N/A"}</Text>
        </View>
      </Page>
    </Document>
  );
}
