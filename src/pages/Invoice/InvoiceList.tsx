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
import { toast } from "react-toastify";

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
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", gap: 20, marginTop: "45px" }}>
          <View style={{ fontSize: "12px",marginTop:"3px" }}>
            <Text>Junk Removal</Text>
            <Text>115 Sunridge way</Text>
            <Text>Redlands Ca 92373 redlands CA 92373</Text>
            <Text>(714) 908-7314</Text>
             <Text>junkguysoc@gmail.com</Text>
          </View>
        </View>

        <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>INVOICE</Text>
          <Text style={{ marginTop: 15 }}>
            Invoice Number: {record.fields.InvoiceNumber}
          </Text>
          <Text style={{marginTop:"3px"}}>
            Invoice Date: {record.fields.DateCreated?.split("T")[0]}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { marginTop: 20, flexDirection: "row" }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "bold" }}>Bill To:</Text>
          <Text>{record.fields.CustomerName?.[0]}</Text>
          <Text>
             {record.address}
        </Text>
        <Text>
             {record.phonenumber}
        </Text>
        <Text>
             {record.email}
        </Text>
        </View>

        <View style={{ flex: 1, alignItems: "center" }}>
          {/* <Text style={{ fontWeight: "bold" }}>Service Location:</Text> */}
          <Text></Text>
          <Text></Text>
        </View>

        <View style={{ flex: 1 }} />
      </View>

<View style={styles.table}>
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

  {record.invoiceDetails && record.invoiceDetails.length > 0 ? (
    record.invoiceDetails.map((detail: any, index: number) => (
      <View style={styles.tableRow} key={index}>
        <View style={styles.tableCol}>
          <Text>{detail.ItemName}</Text>
        </View>
        <View style={styles.tableCol}>
          <Text>{detail.Quantity || 1}</Text>
        </View>
        <View style={styles.tableCol}>
          <Text>${detail.Price}</Text>
        </View>
        <View style={styles.tableCol}>
          <Text>
            ${((detail.Price || 0) * (detail.Quantity || 1)).toFixed(2)}
          </Text>
        </View>
      </View>
    ))
  ) : (
    <View style={styles.tableRow}>
      <View style={styles.tableCol}>
        <Text>No items</Text>
      </View>
      <View style={styles.tableCol}>
        <Text>-</Text>
      </View>
      <View style={styles.tableCol}>
        <Text>-</Text>
      </View>
      <View style={styles.tableCol}>
        <Text>-</Text>
      </View>
    </View>
  )}
</View>

   
      <View
  style={{
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
  }}
>

  <View style={styles.terms}>
    <Text>
      <Text style={{ fontWeight: "bold" }}>Terms: </Text>
      By paying the due balance on invoices provided, the Client hereby
      acknowledges that all requested service items for this date and/or
      any other dates listed above in the description section of the
      table, have been performed and have been tested showing successful
      satisfactory install/repair, unless otherwise stated on the invoice,
      in which labor service charges still apply if any repairs have been
      made. By accepting this invoice, the Client agrees to pay in full
      the amount listed in the Total section of the invoice.
    </Text>
  </View>

  <View style={[styles.notes, { textAlign: "left", marginTop: 8 }]}>
    <Text>Notes: {record.fields.Notes || "No additional notes"}</Text>
  </View>

  <View
    style={{
      marginTop: 15,
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "17px",
    }}
  >
    <Text>Thank you for your business!</Text>
  </View>
</View>
    </Page>
  </Document>
);

export default function InvoiceList() {
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [previewRecord, setPreviewRecord] = useState<any | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 

  const fetchData = async () => {
    try {
      setLoading(true);
      const res1 = await fetch(
        "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblIl5Qvrlok2MF5V",
        {
          headers: {
            Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`,
          },
        }
      );
  
      const data1 = await res1.json();
      const mainRecords = data1.records || [];
  
      const updatedRecords = await Promise.all(
        mainRecords.map(async (record: any) => {
          const customerId = record.fields.CustomerId[0];
          const invoiceId = record.fields.InvoiceId;

          let customerData: any = {};
          let invoiceDetails: any[] = [];

          const res2 = await fetch(
            `https://api.airtable.com/v0/appxmoiNZa85I7nye/tbl5zFFDDF4N3hYv0/${customerId}`,
            {
              headers: {
                Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`,
              },
            }
          );

          const data2 = await res2.json();
          customerData = data2.fields || [];

          if (invoiceId) {
            const res3 = await fetch(
              `https://api.airtable.com/v0/appxmoiNZa85I7nye/tbl7FLdkgynX4tg5Q?filterByFormula={InvoiceId}='${invoiceId}'`,
              {
                headers: {
                  Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`,
                },
              }
            );

            const data3 = await res3.json();
            invoiceDetails = data3.records?.map((r: any) => r.fields) || [];
          }

          return {
            ...record,
            email: customerData.EmailAddress || "",
            address: customerData.Address || "",
            phonenumber: customerData.PhoneNumber || "",
            invoiceDetails, 
          };
        })
      );

      setRecords(updatedRecords);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = records.filter((r) =>
    r.fields.InvoiceNumber?.toLowerCase().includes(query.toLowerCase())
  );


  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

 
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const openPDF = async (record: any) => {
    setPdfLoading(true);
    const blob = await pdf(<InvoicePDF record={record} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url);
    setPdfLoading(false);
  };

  const handleEditSave = async () => {
    if (!editRecord) return;

    try {
      await fetch("https://hook.us2.make.com/drl5ee3otd0bpfl98bfl283pfzd2hshr", {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
                    "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
        },
        body: JSON.stringify({
          recordId: editRecord.id,
          item: editRecord.fields.Item,
          price: editRecord.fields.Price,
          quantity: editRecord.fields.Quantity,
          customerId: editRecord.fields.CustomerId,
          action:"update"
        }),
      });

      setRecords((prev) =>
        prev.map((r) => (r.id === editRecord.id ? { ...r, fields: editRecord.fields } : r))
      );
      await fetchData();
      toast.success("Successfully Updated!")
    } catch (error) {
      console.error("Error sending data to webhook:", error);
    } finally {
      setEditRecord(null); 
    }
  };

  const handleSendInvoices = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select invoice.");
      return;
    }

    const cloudName = "doj0vye62";
    const cloudinaryUploadPreset = "Qoute_FileName";

    const selectedRecords = records.filter((r) => selectedIds.includes(r.id));

    try {
      const invoicesWithPdf = await Promise.all(
        selectedRecords.map(async (r) => {
          const pdfBuffer = await pdf(<InvoicePDF record={r} />).toBuffer();

          const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
          const pdfFile = new File([pdfBlob], `Invoice_${r.id}.pdf`, {
            type: "application/pdf",
          });

          const formData = new FormData();
          formData.append("file", pdfFile);
          formData.append("upload_preset", cloudinaryUploadPreset);
          formData.append("public_id", `Invoice_${r.id}`);

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          const uploadData = await uploadRes.json();

          if (!uploadData.secure_url) {
            throw new Error("Cloudinary upload failed: " + JSON.stringify(uploadData));
          }

          return {
            item: r.fields.Item || "",
            price: r.fields.Price || 0,
            quantity: r.fields.Quantity || 1,
            pdfUrl: uploadData.secure_url, 
            recordId: r.id || "",
            customerId: r.fields.CustomerId || "",
          };
        })
      );

      await fetch("https://hook.us2.make.com/drl5ee3otd0bpfl98bfl283pfzd2hshr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
        },
        body: JSON.stringify({
          action: "send",
          invoices: invoicesWithPdf,
        }),
      });

      toast.success("Invoices sent successfully!");
      setSelectedIds([]);
      await fetchData(); 
    } catch (err) {
      console.error("Error sending invoices:", err);
      toast.error("Failed to send invoices.");
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 mx-1  text-sm ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed text-sm font-medium'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium'
        }`}
      >
        ‹
      </button>
    );

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 mx-1  text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="px-2 py-2 text-gray-500">...</span>);
      }
    }

  
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2  font-medium text-sm ${
            currentPage === i
              ? 'text-blue-600 bg-blue-50 border-blue-300 border'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

   
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="px-2 py-2 text-gray-500">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 mx-1  text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
        >
          {totalPages}
        </button>
      );
    }

  
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 mx-1  text-md ${
          currentPage === totalPages
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {/* <ChevronRight size={16} /> */}
        ›
      </button>
    );

    return buttons;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 dark:text-white">
    <div className="max-w-7xl mx-auto mt-10">
      <div className="mb-6 flex flex-col gap-2">

        <div className="flex justify-end">
        <button
          onClick={handleSendInvoices}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded shadow text-sm"
        >
          <Send size={18} /> Send
        </button>
        </div>
        <input
          type="text"
          placeholder="Search invoice..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md border rounded-md px-3 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white"
        />
      </div>
{/* 
      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading invoices...</div>
      ) : ( */}
        <>
        <div className="w-full">
         <div className="w-full overflow-x-auto h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
         {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    Loading Invoices...
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
          <table className="w-full table-fixed  border-gray-200 text-xs sm:text-sm divide-y divide-gray-200 text-center">
            <thead className="bg-gray-100 dark:bg-gray-800 text-sm sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Select</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Invoice Number</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Customer</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Actions</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Edit</th>
              </tr>
            </thead>

          
            <tbody className="text-md  align-top divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                <>
                  {currentItems.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 text-sm border-b border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(record.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, record.id]);
                            } else {
                              setSelectedIds((prev) =>
                                prev.filter((id) => id !== record.id)
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {record.fields.InvoiceNumber}
                      </td>
                      <td className="px-4 py-3">
                        {record.fields.CustomerName?.[0]}
                      </td>
                      <td className="px-4 py-3">
                        {record.fields.Status === "Active" ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <span className="w-3 h-3 rounded-full bg-green-600"></span>{" "}
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            <span className="w-3 h-3 rounded-full bg-red-600"></span>{" "}
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setPreviewRecord(record)}
                          className="text-blue-600 underline text-md"
                        >
                          Preview
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setEditRecord(record)}
                          className="text-yellow-600 underline text-md"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                   <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
  
                </>
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-2 text-gray-500">
                    No Record Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
            )}
        </div>
        </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 bg-white dark:bg-white/[0.03]">
              <div className="text-sm text-gray-700 dark:text-white">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
              </div>
              <div className="flex justify-center">
                {renderPaginationButtons()}
              </div>
            </div>
        
        </>
      {/* )} */}

      {editRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 transition-opacity duration-300 ease-out"
          onClick={() => setEditRecord(null)} 
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fadeIn"
            onClick={(e) => e.stopPropagation()} 
          >
            <h2 className="text-lg font-semibold mb-4">Edit Invoice</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Item</label>
                <input
                  type="text"
                  value={editRecord.fields.Item || ""}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      fields: { ...editRecord.fields, Item: e.target.value },
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input
                  type="number"
                  value={editRecord.fields.Price || ""}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      fields: { ...editRecord.fields, Price: Number(e.target.value) },
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Quantity</label>
                <input
                  type="number"
                  value={editRecord.fields.Quantity || 1}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      fields: { ...editRecord.fields, Quantity: Number(e.target.value) },
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm shadow"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditRecord(null)}
                className="px-4 py-2 rounded-lg shadow text-sm bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 rounded-lg shadow text-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {previewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Invoice Preview</h2>
              <button
                onClick={() => setPreviewRecord(null)}
                className="text-red-500 font-bold"
              >
                ✕
              </button>
            </div>

            {pdfLoading ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Generating PDF...
              </div>
            ) : (
              <div style={{ width: "100%", height: "80vh" }}>
                <PDFViewer style={{ width: "100%", height: "100%" }}>
                  <InvoicePDF record={previewRecord} />
                </PDFViewer>
              </div>
            )}

            <div className="p-4 border-t flex justify-end gap-2">
              <PDFDownloadLink
                document={<InvoicePDF record={previewRecord} />}
                fileName={`Invoice_${previewRecord.fields.InvoiceNumber || "file"}.pdf`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 text-sm"
              >
                {({ loading }) =>
                  loading ? "Preparing..." : "Download PDF"
                }
              </PDFDownloadLink>

              <button
                onClick={() => openPDF(previewRecord)}
                disabled={pdfLoading}
                className={`px-4 py-2 rounded-lg shadow text-sm ${
                  pdfLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {pdfLoading ? "Opening..." : "Open in New Tab"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}