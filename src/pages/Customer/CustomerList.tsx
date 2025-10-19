import { useEffect, useState, useRef } from "react"; // ✅ added useRef
import { toast } from "react-toastify";

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
  const [selectedId, setSelectedId] = useState<string | null>(null); // ✅ only one selection
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [newClient, setNewClient] = useState({
    fullname: "",
    email: "",
    address: "",
    phone: "",
  });
  const editRef = useRef<HTMLTableRowElement | null>(null); // ✅ to detect outside click

  const AIRTABLE_API = "https://api.airtable.com/v0/appxmoiNZa85I7nye/tbl5zFFDDF4N3hYv0/";
  const AIRTABLE_KEY = "patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609";
  const WEBHOOK_URL = "https://hook.us2.make.com/xh29xj5mwoznluv87etbl5re4l37m8vd";

  const recordsPerPage = 10;

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateCustomer = async (id: string) => {
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
        },
        body: JSON.stringify({ action: "update", id, fields: form }),
      });
      toast.success("Updated Successfully");
      setEditingId(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (editRef.current && !editRef.current.contains(e.target as Node)) {
        setEditingId(null);
      }
    }
    if (editingId) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingId]);

  const deleteCustomer = async () => {
    if (!deleteId) return;
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
        },
        body: JSON.stringify({ action: "delete", id: deleteId }),
      });
      toast.success("Deleted Successfully");
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

  const handleAction = (action: string) => {
    setDropdownOpen(false);
    if (action === "create") {
      setShowModal(true); 
    } else if (action === "edit") {
      if (!selectedId) {
        toast.warn("Please select one customer to edit.");
        return;
      }
      const selected = customers.find((c) => c.id === selectedId);
      if (selected) startEdit(selected);
    } else if (action === "delete") {
      if (!selectedId) {
        toast.warn("Please select one customer to delete.");
        return;
      }
      setDeleteId(selectedId);
    }
  };


  const handleAddClient = async () => {
    if (
      !newClient.fullname.trim() ||
      !newClient.email.trim() ||
      !newClient.address.trim() ||
      !newClient.phone.trim()
    ) {
      toast.warn("Please fill in all fields");
      return;
    }

    setLoadingClient(true);
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
        },
        body: JSON.stringify({
          action: "create",
          fields: {
            CustomerName: newClient.fullname,
            EmailAddress: newClient.email,
            Address: newClient.address,
            PhoneNumber: newClient.phone
          },
        }),
      });
      toast.success("Customer added successfully!");
      setShowModal(false);
      setNewClient({ fullname: "", email: "", address: "", phone: "" });
      fetchCustomers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add customer");
    } finally {
      setLoadingClient(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200  p-6 dark:text-white ">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-200 rounded px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="relative">
        <button
            disabled={!selectedId}
            onClick={() => selectedId && setDropdownOpen(!dropdownOpen)}
            className={`px-2 py-1 rounded-md text-sm font-medium transition ${
                selectedId
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer dark:bg-gray-500"
                : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-300"
            }`}
            >
            Actions ▾
            </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-black border border-gray-200 rounded shadow-lg z-20 dark:text-white">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleAction("create")}
              >
                ➕ Create
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleAction("edit")}
              >
                ✏️ Edit Selected
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleAction("delete")}
              >
                🗑️ Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col h-[600px]">
        <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
        {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    Loading...
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
            <table className="min-w-full">
              <thead className="bg-gray-100 dark:bg-gray-800  text-sm sticky top-0 z-10 text-left">
                <tr>
                  <th className="px-4 py-3 border-b w-10"></th>
                  <th className="px-4 py-3 border-b">Customer Name</th>
                  <th className="px-4 py-3 border-b">Phone</th>
                  <th className="px-4 py-3 border-b">Email</th>
                  <th className="px-4 py-3 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length > 0 ? (
                  currentRecords.map((customer) => (
                    <tr
                    key={customer.id}
                    ref={editingId === customer.id ? editRef : null}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 text-sm border-b"
                  >
                      <td className="px-6 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedId === customer.id} 
                          onChange={() =>
                            setSelectedId(
                              selectedId === customer.id ? null : customer.id
                            )
                          }
                        />
                      </td>

                      {editingId === customer.id ? (
                        <>
                          <td className="px-6 py-3">
                            <input
                              name="CustomerName"
                              value={form.CustomerName}
                              onChange={handleChange}
                              className="border p-1 w-full rounded"
                            />
                          </td>
                          <td className="px-6 py-3">
                            <input
                              name="PhoneNumber"
                              value={form.PhoneNumber}
                              onChange={handleChange}
                              className="border p-1 w-full rounded"
                            />
                          </td>
                          <td className="px-6 py-3">
                            <input
                              name="EmailAddress"
                              value={form.EmailAddress}
                              onChange={handleChange}
                              className="border p-1 w-full rounded"
                            />
                          </td>
                          <td className="px-6 py-3">
                            <select
                                name="Status"
                                value={form.Status}
                                onChange={handleChange}
                                className={`border p-1 w-full rounded text-white font-medium ${
                                form.Status === "Active"
                                    ? "bg-green-500"
                                    : form.Status === "Pending"
                                    ? "bg-orange-500"
                                    : "bg-red-500"
                                }`}
                            >
                                <option
                                value="Active"
                                style={{ backgroundColor: "#4ade80", color: "white" }} 
                                >
                                Active
                                </option>
                                <option
                                value="Pending"
                                style={{ backgroundColor: "#fb923c", color: "white" }} 
                                >
                                Pending
                                </option>
                                <option
                                value="Inactive"
                                style={{ backgroundColor: "#f87171", color: "white" }} 
                                >
                                Inactive
                                </option>
                            </select>
                            </td>
                            <td className="px-6 py-3 flex gap-2">
                                <button
                                  onClick={() => updateCustomer(customer.id)} 
                                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)} 
                                  className="bg-gray-400 hover:bg-gray-500 text-white text-sm px-3 py-1 rounded"
                                >
                                  Cancel
                                </button>
                              </td>

                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2">{customer.fields.CustomerName}</td>
                          <td className="px-4 py-2">{customer.fields.PhoneNumber}</td>
                          <td className="px-4 py-2">{customer.fields.EmailAddress}</td>
                          <td className="px-4 py-2">{customer.fields.Status}</td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 border-t pt-4 ">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              {totalRecords === 0
                ? "No entries found"
                : `Showing ${startIndex + 1} to ${Math.min(
                    endIndex,
                    totalRecords
                  )} of ${totalRecords} entries`}
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium border ${
                    currentPage === pageNum
                      ? "text-blue-600  border-blue-500"
                      : "text-gray-500 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg w-96 text-center dark:bg-gray-800">
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
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-96 relative transition-all duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Add New Client
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white"
                value={newClient.fullname}
                onChange={(e) =>
                  setNewClient({ ...newClient, fullname: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Address"
                className="w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white"
                value={newClient.address}
                onChange={(e) =>
                  setNewClient({ ...newClient, address: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white"
                value={newClient.phone}
                onChange={(e) =>
                  setNewClient({ ...newClient, phone: e.target.value })
                }
              />

              <button
                onClick={handleAddClient}
                disabled={loadingClient}
                className={`w-full mt-3 text-white py-2 rounded-md transition ${
                  loadingClient
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loadingClient ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    
  );
}
