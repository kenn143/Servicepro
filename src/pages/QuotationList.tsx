import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface Quote {
  id: string;
  quoteId?: string;
  clientID?: string;
  jobTitle?: string;
  quoteLink?: string;
  status?: string;
}

interface Customer {
  recordId?:string;
  CustomerId?: string;
  CustomerName?: string;
}

const QuotationList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      toast.warning("No quotes selected.");
      return;
    }
  
    if (selectedIds.length > 1) {
      toast.warning("You can only send one record at a time.");
      return;
    }
    
  
    const recordId = selectedIds[0]; 
    const selectedQuote = data.find((q) => q.id === recordId);

    if (!selectedQuote) {
      toast.error("Quote not found.");
      return;
    }
    const customer = customerList.find(
      (c) => c.CustomerId === selectedQuote.clientID
    );

    try {
      const response = await fetch(
        "https://hook.us2.make.com/rux68caxuw6fvkeyg1ptt7ntn5vpm6bj",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
          },
          body: JSON.stringify({
            recordId, 
            clientId: selectedQuote.clientID, 
            customerRecordId: customer?.recordId || null, 
            accessibleLink: `https://servicepro-omega.vercel.app/customerPreview?id=${recordId}`, 
          }),
        }
      );
  
      if (response.ok) {
        toast.success("Sent successfully!");
        setSelectedIds([]); 
      } else {
        toast.error("Failed to send.");
      }
    } catch (error) {
      console.error("Error sending:", error);
      toast.error("Error sending data.");
    }
  };
  
  

  const toggleCheckbox = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleRedirect = (id: string) => {
    navigate(`/quotation?id=${id}`);
  };

  // useEffect(() => {
  //   const fetchQuotes = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblbF4N9Ixi3mRFKW",
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization:
  //               "Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609",
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }

  //       const result = await response.json();
  //       const records: Quote[] = result.records.map((record: any) => ({
  //         id: record.id,
  //         quoteId: record.fields["Quote ID"],
  //         clientID: record.fields["ClientID"],
  //         jobTitle: record.fields["Job Title"],
  //         quoteLink: `/Preview?id=${record.id}`,
  //         status: record.fields["Status"],
  //       }));
  //       setData(records);
  //     } catch (error) {
  //       console.error("Error fetching quotes:", error);
  //     }
  //   };


  //   const fetchCustomers = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await fetch(
  //         "https://api.airtable.com/v0/appxmoiNZa85I7nye/tbl5zFFDDF4N3hYv0",
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization:
  //               "Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609",
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }

  //       const result = await response.json();
  //       const customers: Customer[] = result.records.map((record: any) => ({
  //         CustomerId: record.fields["CustomerId"],
  //         CustomerName: record.fields["CustomerName"],
  //       }));
  //       console.log("cusotmelist",customers)
  //       setCustomerList(customers);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching customers:", error);
  //     }
  //   };

  //   fetchQuotes();
  //   fetchCustomers();
  // }, []);

const fetchQuotes = async () => {
  try {
    const response = await fetch(
      "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblbF4N9Ixi3mRFKW",
      {
        method: "GET",
        headers: {
          Authorization:
            "Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    const records: Quote[] = result.records.map((record: any) => ({
      id: record.id,
      quoteId: record.fields["Quote ID"],
      clientID: record.fields["ClientID"],
      jobTitle: record.fields["Job Title"],
      quoteLink: `/Preview?id=${record.id}`,
      status: record.fields["Status"],
    }));
    setData(records);
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
};

const fetchCustomers = async () => {
  setLoading(true);
  try {
    const response = await fetch(
      "https://api.airtable.com/v0/appxmoiNZa85I7nye/tbl5zFFDDF4N3hYv0",
      {
        method: "GET",
        headers: {
          Authorization:
            "Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    const customers: Customer[] = result.records.map((record: any) => ({
      recordId:record.id,
      CustomerId: record.fields["CustomerId"],
      CustomerName: record.fields["CustomerName"],
    }));
    setCustomerList(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchQuotes();
  fetchCustomers();
}, []);
  

  const handleDelete = async (id: string) => {
    let quotation = {
      isDeleted: true,
      recordId: id,
    };
    const response = await fetch(
      "https://hook.us2.make.com/wefhgttc2tgkb87snbopatvnia7v6yzz",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
        },
        body: JSON.stringify(quotation),
      }
    );
    if (response.ok) {
      toast.success("Deleted Successfully!");
      fetchQuotes();
      fetchCustomers();
    } else {
      toast.error("Error");
    }
  };
  


  const filteredData = data.filter((item) =>
    item.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);

  const currentRecords = filteredData.slice(startIndex, endIndex);

  return (
    <>
      <PageMeta title="ServicePros" description="" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendars">
          <div className="min-h-screen px-4 font-sans flex flex-col items-center">
            {/* <div className="w-full max-w-6xl py-6 flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-2 sm:space-y-0 text-center mt-[20px]">
              <img
                src="/images/Lights-Installer-Logo.webp"
                alt="Lights Installer Logo"
                className="h-10 sm:h-12"
              />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 dark:text-white">
                Light Installers Quote App
              </h1>
            </div> */}

            <div className="w-full max-w-6xl p-4 sm:p-6 md:p-10 rounded-2xl mt-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 px-2 gap-2">
                <input
                  type="text"
                  placeholder="Search by Job Title"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-4 py-2 w-full sm:max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:text-white"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded shadow sm:text-sm" 
                    onClick={() => navigate("/quote-entry")}
                  >
                    New Quote
                  </button>
                  <button
                    className={`px-6 py-1 rounded shadow sm:text-sm
                      ${
                        selectedIds.length === 1
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    onClick={handleSend}
                    disabled={selectedIds.length !== 1} 
                  >
                    Send
                  </button>
                </div>
              </div>
              <div className="w-full ">
                <div className="overflow-y-auto h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
                {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    Loading Light Installers...
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
                  <table className="w-full table-fixed border-collapse text-[10px] sm:text-sm text-center">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-sm sticky top-0 z-10">
                      <tr className="text-gray-800 dark:text-white/90 text-sm">
                      <th className="px-2 py-3 border-b border-gray-200 dark:border-gray-700">Select</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Job Title</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Client Name</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Quote</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Status</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Edit</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-200 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700 text-sm"
                        >
                             <td className="px-2 py-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => toggleCheckbox(item.id)}
                            />
                          </td>
                          <td className="px-2 sm:px-4 py-2 whitespace-normal break-words text-sm">
                            {item.jobTitle}
                          </td>
                          <td className="px-2 sm:px-4 py-2 whitespace-normal break-words">
                            {customerList.find(
                              (cust) => cust.CustomerId === item.clientID
                            )?.CustomerName || "Unknown Client"}
                          </td>
                          <td className="px-1 sm:px-4 py-2">
                          <button
                            onClick={() => handleRedirect(item.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded sm:text-sm transition-colors"
                          >
                            View
                          </button>

                          </td>
                          <td className="px-3 sm:px-4 py-2">
                            {item.status === "Approved" ? (
                              <div className=" text-black px-1 py-1 rounded cursor-default w-15 dark:text-white">
                                <span className="inline-flex items-center gap-1 text-green-600">
                            <span className="w-3 h-3 rounded-full bg-green-600"></span> Approved
                          </span>
                              </div>
                            ) : (
                              <div className=" text-blue-700 px-1 py-1 rounded cursor-default w-15 dark:text-white">
                               <span className="inline-flex items-center gap-1 text-yellow-600 ">
                            <span className="w-3 h-3 rounded-full bg-yellow-600"></span> Pending
                          </span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 py-2">
                            <button
                              className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded shadow sm:text-sm"
                              onClick={() =>
                                navigate("/edit/" + item.id, {
                                  state: {
                                    item,
                                    CustomerName:
                                      customerList.find(
                                        (cust) => cust.CustomerId === item.clientID
                                      )?.CustomerName || "Unknown Client",
                                  },
                                })
                              }
                            >
                              Edit
                            </button>
                          </td>
                          <td className="px-3 sm:px-4 py-2">
                            <button
                              className="bg-orange-700 hover:bg-orange-800 text-white px-2 py-1 rounded shadow sm:text-sm"
                              onClick={() => setShowConfirm(item.id)}
                            >
                              Delete
                            </button>

                            {showConfirm === item.id && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <div className="bg-white/90 rounded-xl p-6 w-80 shadow-lg">
                                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    Are you sure you want to delete?
                                  </h2>
                                  <div className="flex justify-end space-x-3">
                                    <button
                                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                                      onClick={() => setShowConfirm(null)}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                      onClick={() => {
                                        handleDelete(item.id);
                                        setShowConfirm(null);
                                      }}
                                    >
                                      Confirm
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                          </td>
                        </tr>
                      ))}
                      {/* {loading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-4 text-center text-gray-500 h-20"
                          >
                            Loading...
                          </td>
                        </tr>
                      ) : currentRecords.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-4 text-center text-gray-500 h-20"
                          >
                            No results found.
                          </td>
                        </tr>
                      ) : null} */}
                    </tbody>
                  </table>
                   )}
                </div>

         
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 bg-white dark:bg-white/[0.03]">

                  <div>
                    {totalRecords === 0
                      ? "No entries found"
                      : `Showing ${startIndex + 1} to ${endIndex} of ${totalRecords} entries`}
                  </div>

                  <div className="flex items-center gap-1">

                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border  disabled:opacity-50 dark:border-gray-700"
                    >
                      ‹
                    </button>


                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-2 border  ${
                          currentPage === i + 1
                            ? "text-blue-600 bg-blue-50 border-blue-300"
                            : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}


                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border rounded disabled:opacity-50 dark:border-gray-700"
                    >
                      ›
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
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
  );
};

export default QuotationList;
