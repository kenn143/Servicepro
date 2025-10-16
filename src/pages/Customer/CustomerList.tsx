import { useEffect, useState } from "react";

interface Customer {
  id: string;
  createdTime: string;
  fields: {
    CustomerId: number;
    CustomerName: string;
    Address: string;
    Status: string;
    PhoneNumber: string;
    EmailAddress: string;
    DateCreated: string;
  };
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const AIRTABLE_API = "https://api.airtable.com/v0/appxmoiNZa85I7nye/tbl5zFFDDF4N3hYv0/";
  const AIRTABLE_KEY = "patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609";
  const WEBHOOK_URL = "https://hook.us2.make.com/xh29xj5mwoznluv87etbl5re4l37m8vd";

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(AIRTABLE_API, {
        headers: { Authorization: `Bearer ${AIRTABLE_KEY}` },
      });
      const data = await res.json();
      setCustomers(data.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const startEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setForm({ ...customer.fields });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateCustomer = async (id: string) => {
    try {

      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id, fields: form }),
      });

      setEditingId(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCustomer = async () => {
    if (!deleteId) return;
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: deleteId }),
      });

      setDeleteId(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    search.trim() === ""
      ? true
      : c.fields.CustomerName.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecords = filteredCustomers.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredCustomers.slice(startIndex, endIndex);

  const goToPage = (page: number) => setCurrentPage(page);
  const goToPrevious = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handleRecordsPerPageChange = (num: number) => {
    setRecordsPerPage(num);
    setCurrentPage(1);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 dark:text-white">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-200 dark:border-gray-700 rounded px-4 py-2 text-sm w-64 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-2 text-sm">
          <span>Show:</span>
          <select
            value={recordsPerPage}
            onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
            className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 dark:bg-gray-800"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
          <span>per page</span>
        </div>
      </div>

      <div className="flex flex-col h-[650px]">
        <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 rounded-full relative">
                  <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  Loading customers...
                </div>
              </div>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-100 dark:bg-gray-800 text-sm sticky top-0 z-10 text-left">
                <tr>
                  <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Customer Name</th>
                  <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Phone</th>
                  <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Email</th>
                  <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Status</th>
                  <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length > 0 ? (
                  currentRecords.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 text-sm border-b border-gray-100 dark:border-gray-800">
                      {editingId === customer.id ? (
                        <>
                          <td className="px-4 py-2">
                            <input
                              name="CustomerName"
                              value={form.CustomerName}
                              onChange={handleChange}
                              className="border p-1 w-full rounded"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              name="PhoneNumber"
                              value={form.PhoneNumber}
                              onChange={handleChange}
                              className="border p-1 w-full rounded"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              name="EmailAddress"
                              value={form.EmailAddress}
                              onChange={handleChange}
                              className="border p-1 w-full rounded"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              name="Status"
                              value={form.Status}
                              onChange={handleChange}
                              className="border p-1 w-full rounded"
                            />
                          </td>
                          <td className="px-4 py-2 flex gap-2">
                            <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => updateCustomer(customer.id)}>Save</button>
                            <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => setEditingId(null)}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2">{customer.fields.CustomerName}</td>
                          <td className="px-4 py-2">{customer.fields.PhoneNumber}</td>
                          <td className="px-4 py-2">{customer.fields.EmailAddress}</td>
                          <td className="px-4 py-2">{customer.fields.Status}</td>
                          <td className="px-4 py-2 flex gap-2">
                            <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => startEdit(customer)}>Edit</button>
                            <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => setDeleteId(customer.id)}>Delete</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 bg-white dark:bg-white/[0.03]">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalRecords === 0
              ? "No entries found"
              : `Showing ${startIndex + 1} to ${Math.min(endIndex, totalRecords)} of ${totalRecords} entries`}
          </div>

          <div className="flex items-center space-x-1">
            {totalPages > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (totalPages > 7) {
                    if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 2) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium border ${
                            currentPage === pageNum
                              ? "text-blue-600 bg-blue-50 border-blue-300 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-600"
                              : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      (pageNum === 2 && currentPage > 4) ||
                      (pageNum === totalPages - 1 && currentPage < totalPages - 3)
                    ) {
                      return <span key={pageNum} className="px-2">...</span>;
                    } else return null;
                  } else {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium border ${
                            currentPage === pageNum
                              ? "text-blue-600 bg-blue-50 border-blue-300 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-600"
                              : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                })}

                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  ›
                </button>
              </>
            )}
          </div>
          </div>
        </div>
      </div>
      {deleteId && (
  <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex justify-center items-center z-50">
    <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg w-96 text-center">
      <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
      <p className="mb-6">Are you sure you want to delete this customer?</p>
      <div className="flex justify-center gap-4">
        <button
          className="bg-red-500 text-white px-2 py-1 rounded"
          onClick={deleteCustomer}
        >
          Delete
        </button>
        <button
          className="bg-gray-300 px-2 py-1 rounded"
          onClick={() => setDeleteId(null)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
