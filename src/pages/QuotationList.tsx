import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Types
interface Quote {
  id: string;
  quoteId?: string;
  clientID?: string;
  jobTitle?: string;
  quoteLink?: string;
  status?: string;
}

interface Customer {
  clientID?: string;
  clientName?: string;
}

const QuotationList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const handleRedirect = (id: string) => {
    navigate(`/quotation?id=${id}`);
  };

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch(
          "https://api.airtable.com/v0/app4pNHoxT8aj9vzJ/tbluuR1Nl6tbnLhS2",
          {
            method: "GET",
            headers: {
              Authorization:
                "Bearer pat3UfBiORCRUDmnz.e300c4a692d7eebbb77d85848146bc048e39b58cde696374fc7ac9467a61468e",
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
          "https://api.airtable.com/v0/app4pNHoxT8aj9vzJ/tblLRXGbGHNnaf8bF",
          {
            method: "GET",
            headers: {
              Authorization:
                "Bearer pat2hVGQIspOMAhMC.0f845073a21d5cfe012c97f92393af8cdda9d0e33f0f890e2923be81b4f81cfd",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const customers: Customer[] = result.records.map((record: any) => ({
          clientID: record.fields["ClientID"],
          clientName: record.fields["Name"],
        }));
        setCustomerList(customers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

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
        },
        body: JSON.stringify(quotation),
      }
    );
    if (response.ok) {
      toast.success("Deleted Successfully!");
    } else {
      toast.error("Error");
    }
  };

  // filter and paginate
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
            <div className="w-full max-w-6xl py-6 flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-2 sm:space-y-0 text-center mt-[20px]">
              <img
                src="/images/Lights-Installer-Logo.webp"
                alt="Lights Installer Logo"
                className="h-10 sm:h-12"
              />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 dark:text-white">
                Light Installers Quote App
              </h1>
            </div>

            <div className="w-full max-w-6xl p-4 sm:p-6 md:p-10 rounded-2xl shadow-lg mt-6">
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
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm shadow w-full sm:w-auto"
                  onClick={() => navigate("/quote-entry")}
                >
                  New Quote
                </button>
              </div>
              <div className="w-full">
                <div className="overflow-y-auto h-[400px]">
                  <table className="w-full table-fixed border-collapse text-[10px] sm:text-sm">
                    <thead>
                      <tr className="text-gray-800 dark:text-white/90 text-sm">
                        <th className="px-2 sm:px-4 py-2 text-left">Job Title</th>
                        <th className="px-2 sm:px-4 py-2 text-left">Client Name</th>
                        <th className="px-1 sm:px-4 py-2 text-left">Quote</th>
                        <th className="px-2 sm:px-4 py-2 text-left">Status</th>
                        <th className="px-2 sm:px-4 py-2 text-left">Edit</th>
                        <th className="px-1 sm:px-4 py-2 text-left">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-gray-200 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700 text-sm"
                        >
                          <td className="px-2 sm:px-4 py-2 whitespace-normal break-words text-sm">
                            {item.jobTitle}
                          </td>
                          <td className="px-2 sm:px-4 py-2 whitespace-normal break-words">
                            {customerList.find(
                              (cust) => cust.clientID === item.clientID
                            )?.clientName || "Unknown Client"}
                          </td>
                          <td className="px-1 sm:px-4 py-2">
                            <button
                              onClick={() => handleRedirect(item.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow sm:text-sm"
                            >
                              View
                            </button>
                          </td>
                          <td className="px-3 sm:px-4 py-2">
                            {item.status === "Approved" ? (
                              <button className="bg-green-500 text-white px-1 py-1 rounded cursor-default">
                                Approved
                              </button>
                            ) : (
                              <button className="bg-yellow-500 text-white px-1 py-1 rounded cursor-default">
                                Pending
                              </button>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 py-2">
                            <button
                              className="bg-orange-500 hover:bg-orange-600 text-white px-1 py-1 rounded shadow sm:text-sm"
                              onClick={() =>
                                navigate("/edit/" + item.id, {
                                  state: {
                                    item,
                                    clientName:
                                      customerList.find(
                                        (cust) => cust.clientID === item.clientID
                                      )?.clientName || "Unknown Client",
                                  },
                                })
                              }
                            >
                              Edit
                            </button>
                          </td>
                          <td className="px-0 sm:px-4 py-2">
                            <button
                              className="bg-orange-700 hover:bg-orange-800 text-white px-2 py-1 rounded shadow sm:text-sm"
                              onClick={() => setShowConfirm(item.id)}
                            >
                              Delete
                            </button>

                            {showConfirm === item.id && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
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
                      {loading ? (
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
                      ) : null}
                    </tbody>
                  </table>
                </div>

               {/* Pagination Footer */}
<div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
  {/* Left side info */}
  <div>
    {totalRecords === 0
      ? "No entries found"
      : `Showing ${startIndex + 1} to ${endIndex} of ${totalRecords} entries`}
  </div>

  {/* Right side pagination */}
  <div className="flex items-center gap-1">
    {/* Prev button */}
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700"
    >
      ‹
    </button>

    {/* Page numbers */}
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-3 py-1 border rounded ${
          currentPage === i + 1
            ? "text-blue-600 bg-blue-50 border-blue-300"
            : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        }`}
      >
        {i + 1}
      </button>
    ))}

    {/* Next button */}
    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700"
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
    </>
  );
};

export default QuotationList;
