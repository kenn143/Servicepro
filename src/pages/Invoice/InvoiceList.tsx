import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  PDFViewer,
  pdf,
} from "@react-pdf/renderer";

// ✅ PDF styles
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  section: { marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  table: { width: "100%", marginTop: 10, borderStyle: "solid", borderWidth: 1, borderColor: "#000" },
  tableRow: { flexDirection: "row" },
  tableColHeader: { flex: 1, borderStyle: "solid", borderWidth: 1, backgroundColor: "#f0f0f0", padding: 4 },
  tableCol: { flex: 1, borderStyle: "solid", borderWidth: 1, padding: 4 },
  tableCellHeader: { fontWeight: "bold" },
  terms: { marginTop: 15, fontSize: 10 },
  notes: { marginTop: 10, fontSize: 11, fontStyle: "italic" },
});


const InvoicePDF = ({ record }: { record: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text>Invoice Number: {record.fields.InvoiceNumber}</Text>
          <Text>Invoice Date: {record.fields.DateCreated?.split("T")[0]}</Text>
        </View>
      </View>


      <View style={styles.section}>
        <Text>Bill To:</Text>
        <Text>{record.fields.CustomerName?.[0]}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Description</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>QTY</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Price</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Amount</Text></View>
        </View>

        <View style={styles.tableRow}>
          <View style={styles.tableCol}><Text>{record.fields.Item}</Text></View>
          <View style={styles.tableCol}><Text>1</Text></View>
          <View style={styles.tableCol}><Text>{record.fields.Price}</Text></View>
          <View style={styles.tableCol}><Text>{record.fields.Price}</Text></View>
        </View>
      </View>

      {/* Terms */}
      <View style={styles.terms}>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Terms: </Text>
          By paying the due balance on invoices provided, the Client hereby acknowledges that all requested service items
          for this date and/or any other dates listed above in the description section of the table, have been performed
          and have been tested showing successful satisfactory install/repair, unless otherwise stated on the invoice, in
          which labor service charges still apply if any repairs have been made. By accepting this invoice, the Client
          agrees to pay in full the amount listed in the Total section of the invoice.
        </Text>
      </View>

      {/* Notes */}
      <View style={styles.notes}>
        <Text>Notes: {record.fields.Notes || "No additional notes"}</Text>
      </View>
    </Page>
  </Document>
);

export default function InvoiceList() {
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [previewRecord, setPreviewRecord] = useState<any | null>(null);

  // Fetch Airtable data
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblIl5Qvrlok2MF5V",
        {
          headers: {
            Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`,
          },
        }
      );
      const data = await res.json();
      setRecords(data.records || []);
    };
    fetchData();
  }, []);

  const filtered = records.filter((r) =>
    r.fields.InvoiceNumber?.toLowerCase().includes(query.toLowerCase())
  );

const openPDF = async (record: any) => {
  const blob = await pdf(<InvoicePDF record={record} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url);
};

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 rounded-2xl shadow">
      <div className="mb-6 flex flex-col gap-3">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow self-start">
          <Send size={18} /> Send Invoice
        </button>

        <input
          type="text"
          placeholder="Search invoice..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md border rounded-md px-3 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white"
        />
      </div>

      <div className="w-full">
        <table className="w-full border border-gray-200 text-xs sm:text-sm table-fixed">
          <thead className="bg-gray-100 dark:bg-black dark:text-white">
            <tr>
              <th className="w-1/12 px-1 py-1 border text-center">Select</th>
              <th className="w-2/12 px-1 py-1 border">Invoice #</th>
              <th className="w-3/12 px-1 py-1 border">Invoice Name</th>
              <th className="w-3/12 px-1 py-1 border">Customer</th>
              <th className="w-2/12 px-1 py-1 border">Status</th>
              <th className="w-1/12 px-1 py-1 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:text-white">
                  <td className="px-1 py-1 border text-center">
                    <input type="checkbox" />
                  </td>
                  <td className="px-1 py-1 border break-words">{record.fields.InvoiceNumber}</td>
                  <td className="px-1 py-1 border break-words">{record.fields.Item || "N/A"}</td>
                  <td className="px-1 py-1 border break-words">{record.fields.CustomerName?.[0]}</td>
                  <td className="px-1 py-1 border text-center">
                        {record.fields.Status === "Active" ? (
                          <span className="inline-flex items-center gap-1 text-green-600 ">
                            <span className="w-3 h-3 rounded-full bg-green-600"></span> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            <span className="w-3 h-3 rounded-full bg-red-600"></span> Inactive
                          </span>
                        )}
                 </td>
                  <td className="px-1 py-1 border text-center">
                    <button
                      onClick={() => setPreviewRecord(record)}
                      className="text-blue-600 underline text-xs"
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-2 text-gray-500">
                  No Record Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {previewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 ">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b ">
              <h2 className="text-lg font-semibold">Invoice Preview</h2>
              <button
                onClick={() => setPreviewRecord(null)}
                className="text-red-500 font-bold"
              >
                ✕
              </button>
            </div>
          <div style={{ width: "100%", height: "80vh" }}>
            <PDFViewer style={{ width: "100%", height: "100%" }}>
              <InvoicePDF record={previewRecord} />
            </PDFViewer>
          </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <PDFDownloadLink
                document={<InvoicePDF record={previewRecord} />}
                fileName={`Invoice_${previewRecord.fields.InvoiceNumber || "file"}.pdf`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 text-sm"
              >
                Download PDF
              </PDFDownloadLink>

              <button
                onClick={() => openPDF(previewRecord)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 text-sm"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
