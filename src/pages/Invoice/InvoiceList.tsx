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
        <View style={{ flexDirection: "row", gap: 20,marginTop:"40px" }}>
          <View style={{fontSize:"12px"}}>
            <Text >Junk Removal</Text>
            <Text>115 Sunridge way</Text>
            <Text>(714) 908-7314 </Text>
          </View>
      
        </View>

        <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>INVOICE</Text>
          <Text style={{ marginTop: 15 }}>
            Invoice Number: {record.fields.InvoiceNumber}
          </Text>
          <Text>
            Invoice Date: {record.fields.DateCreated?.split("T")[0]}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { marginTop: 20, flexDirection: "row" }]}>
    <View style={{ flex: 1 }}>
      <Text style={{fontWeight:"bold"}}>Bill To:</Text>
      <Text>{record.fields.CustomerName?.[0]}</Text>
    </View>

    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{fontWeight:"bold"}}>Service Location:</Text>
      <Text>Sample Client acm Inc.</Text>
      <Text>5520 Ruffin Road</Text>
    </View>

    <View style={{ flex: 1 }} />
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
          <View style={styles.tableCol}><Text>{record.fields.Quantity || 1}</Text></View>
          <View style={styles.tableCol}><Text>{record.fields.Price}</Text></View>
          <View style={styles.tableCol}><Text>{(record.fields.Price || 0) * (record.fields.Quantity || 1)}</Text></View>
        </View>
      </View>

      {/* Terms */}
      <View style={styles.terms}>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Terms: </Text>
          By paying the due balance on invoices provided, the Client hereby acknowledges that all requested service items for
            this date and/or any other dates listed above in the description section of the table, have been performed and have
            been tested showing successful satisfactory install/repair, unless otherwise stated on the invoice, in which labor
            service charges still apply if any repairs have been made. By accepting this invoice, the Client agrees to pay in full the amount listed in the Total section of the invoice.
        </Text>
      </View>

      {/* Notes */}
      <View style={styles.notes}>
        <Text>Notes: {record.fields.Notes || "No additional notes"}</Text>
      </View>

      <View style={{textAlign:"center",fontWeight: "bold", marginTop:"30px",fontSize:"17px"}}>
        <Text>Thank you for your business!</Text>
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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetch(
  //         "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblIl5Qvrlok2MF5V",
  //         {
  //           headers: {
  //             Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`,
  //           },
  //         }
  //       );
  //       const data = await res.json();
  //       setRecords(data.records || []);
  //     } catch (err) {
  //       console.error("Error fetching data:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblIl5Qvrlok2MF5V",
        {
          headers: {
            Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`,
          },
        }
      );

    
      const data = await res.json();
      console.log("res",data);
      setRecords(data.records || []);
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
      toast.success("Sucessfully Updated!")
    } catch (error) {
      console.error("Error sending data to webhook:", error);
    } finally {
      setEditRecord(null); 
    }
  };

  // const handleSendInvoices = async () => {
  //   if (selectedIds.length === 0) {
  //     toast.error("Please select at least one invoice.");
  //     return;
  //   }
   
  
  //   const selectedRecords = records.filter((r) => selectedIds.includes(r.id));
  
  //   const payload = selectedRecords.map((r) => ({
  //     id: r.id,
  //     item: r.fields.Item,
  //     quantity: r.fields.Quantity || 1,
  //     totalPrice: (r.fields.Price || 0) * (r.fields.Quantity || 1),
  //     notes: r.fields.Notes || "No notes",
  //     attachment: r.fields.Attachment || null, 
  //     price: r.fields.Price || 0,
  //     action: "send"
  //   }));

  
  //   try {
  //     await fetch("https://hook.us2.make.com/drl5ee3otd0bpfl98bfl283pfzd2hshr", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json",
  //                 "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
  //        },
  //       body: JSON.stringify({
  //         action: "send",
  //         invoices: payload,
  //       }),
  //     });
  
  //     toast.success("Invoices sent successfully!");
  //     setSelectedIds([]); 
  //   } catch (err) {
  //     console.error("Error sending invoices:", err);
  //     toast.error("Failed to send invoices.");
  //   }
  // };

  // const handleSendInvoices = async () => {
  //   if (selectedIds.length === 0) {
  //     toast.error("Please select at least one invoice.");
  //     return;
  //   }
  
  //   const selectedRecords = records.filter((r) => selectedIds.includes(r.id));
  
  //   try {
  
  //     const invoicesWithPdf = await Promise.all(
  //       selectedRecords.map(async (r) => {
  //         const pdfBase64 = await generatePdfBase64(r);
         
  //         return {
  //           item: r.fields.Item || "",
  //           price: r.fields.Price || 0,
  //           quantity: r.fields.Quantity || 1,
  //           pdf: pdfBase64, 
  //           recordId: r.id || "",
  //           customerId: r.fields.CustomerId || ""
  //         };
  //       })
  //     );
  //     console.log("the invoicew",invoicesWithPdf);
  
  //     await fetch("https://hook.us2.make.com/drl5ee3otd0bpfl98bfl283pfzd2hshr", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json",
  //                 "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
  //        },
  //       body: JSON.stringify({
  //         action: "send",
  //         invoices: invoicesWithPdf,
  //       }),
  //     });
  
  //     toast.success("Invoices with PDFs sent successfully!");
  //     setSelectedIds([]);
  //     await fetchData(); // reload table
  //   } catch (err) {
  //     console.error("Error sending invoices:", err);
  //     toast.error("Failed to send invoices.");
  //   }
  // };
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
  
  
  
  // const generatePdfBase64 = async (record: any) => {
  //   const blob = await pdf(<InvoicePDF record={record} />).toBlob();
  //   return new Promise<string>((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => resolve(reader.result as string);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(blob); 
  //   });
  // };
  


  return (
    <div className="max-w-7xl mx-auto mt-10">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-blue-950 mb-8 dark:text-white/90 text-center">
          Invoice List
        </h1>
        <div className="flex justify-end">
        <button
          onClick={handleSendInvoices}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded-lg shadow text-md"
        >
          <Send size={18} /> Send Invoice
        </button>

        </div>
        <input
          type="text"
          placeholder="Search invoice..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md border rounded-md px-3 py-2 text-md shadow focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading invoices...</div>
      ) : (
        <div className="w-full">
          <table className="w-full border border-gray-200 text-xs sm:text-sm table-auto">
            <thead className="bg-gray-100 dark:bg-black dark:text-white text-md">
              <tr>
                <th className="px-2 py-1 border text-center w-20">Select</th>
                <th className="px-2 py-1 border">Invoice Number</th>
                {/* <th className="px-2 py-1 border">Invoice Name</th> */}
                <th className="px-2 py-1 border">Customer</th>
                <th className="px-2 py-1 border text-center">Status</th>
                <th className="px-2 py-1 border text-center">Actions</th>
                <th className="px-2 py-1 border text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="text-md">
              {filtered.length > 0 ? (
                filtered.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:text-white">
                    <td className="px-2 py-1 border text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(record.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds((prev) => [...prev, record.id]);
                        } else {
                          setSelectedIds((prev) => prev.filter((id) => id !== record.id));
                        }
                      }}
                    />

                    </td>
                    <td className="px-2 py-1 border break-words w-50">{record.fields.InvoiceNumber}</td>
                    {/* <td className="px-2 py-1 border break-words"></td> */}
                    <td className="px-2 py-1 border break-words w-50">{record.fields.CustomerName?.[0]}</td>
                    <td className="px-2 py-1 border text-center w-50">
                      {record.fields.Status === "Active" ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <span className="w-3 h-3 rounded-full bg-green-600"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                          <span className="w-3 h-3 rounded-full bg-red-600"></span> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1 border text-center w-50">
                      <button
                        onClick={() => setPreviewRecord(record)}
                        className="text-blue-600 underline text-md"
                      >
                        Preview
                      </button>
                    </td>
                    <td className="px-2 py-1 border text-center w-40">
                      <button
                        onClick={() => setEditRecord(record)}
                        className="text-yellow-600 underline text-md"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-2 text-gray-500">
                    No Record Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}


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
  );
}
