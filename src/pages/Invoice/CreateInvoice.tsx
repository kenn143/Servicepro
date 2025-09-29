import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { ReceiptText, Check } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type Customer = {
  CustomerId: string;
  CustomerName: string;
  Address: string;
  Status: string;
  PhoneNumber: string;
  EmailAddress: string;
  DateCreated: string;
};

type Item = {
  quantity: number;
  price: number;
  total: number;
  itemName:string;
};

const steps = ["Add Item", "Notes", "Attachment"];

export default function CreateInvoice() {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [items, setItems] = useState<Item[]>([{ quantity: 0, price: 0, total: 0,itemName:"" }]);
  // const [itemName, setItemName] = useState("");
  const [notes, setNotes] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const [saving,setSaving] = useState(false);

  const AIRTABLE_ENDPOINT =
    "https://api.airtable.com/v0/appxmoiNZa85I7nye/tbl5zFFDDF4N3hYv0";
  const AIRTABLE_TOKEN =
    "patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609";

  const cloudName = "doj0vye62";
  const uploadPreset = "Qoute_FileName";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachmentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview(null);
      }
    }
  };

  const handleChange = async (value: string) => {
    setQuery(value);
    setFiltered([]);
    if (value.trim() === "") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${AIRTABLE_ENDPOINT}?filterByFormula=SEARCH(LOWER("${value}"), LOWER({CustomerName}))`,
        { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      const results: Customer[] = data.records.map((rec: any) => ({
        CustomerId: rec.id,
        CustomerName: rec.fields.CustomerName || "",
        Address: rec.fields.Address || "",
        Status: rec.fields.Status || "Unknown",
        PhoneNumber: rec.fields.PhoneNumber || "",
        EmailAddress: rec.fields.EmailAddress || "",
        DateCreated: rec.createdTime,
      }));

      setFiltered(results);
    } catch (error) {
      console.error(error);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer: Customer) => {
    setQuery("");
    setFiltered([]);
    setLoading(false);
    setSelectedCustomer(customer);

  };

  const nextStep = () => {
    // if (!itemName.trim()) {
    //   toast.error("Item name is required")
    //   return;
    // }
    if (items.some(item => item.itemName.trim() === "")) {
      toast.error("Item name cannot be empty");
      return;
    }
   
    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
  };



  const prevStep = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const handleRedirect = () => {
    window.location.href = "/create-invoice";
  };

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const newItems = [...items];
  
    if (field === "quantity" || field === "price") {
      newItems[index][field] = Number(value) as Item[typeof field];
      newItems[index].total = newItems[index].price * newItems[index].quantity;
    } else if (field === "itemName") {
      newItems[index][field] = value as Item[typeof field];
    }
  
    setItems(newItems);
  };

  // const addItem = () => {
  //   setItems([...items, { quantity: 0, price: 0, total: 0 }]);
  // };
  const addItem = () => {
    if (items.some(item => item.itemName.trim() === "")) {
      toast.error("Item name cannot be empty");
      return;
    }
    setItems([...items, { itemName: "", quantity: 0, price: 0, total: 0 }]);
  };

  const totalCost = items.reduce((acc, item) => acc + item.total, 0);

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        console.error("Cloudinary upload error:", data);
        return null;
      }
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    if (!selectedCustomer) {
      alert("Please select a customer before saving.");
      return;
    }
    

    let attachmentUrl: string | null = null;

    if (attachment) {
      attachmentUrl = await uploadToCloudinary(attachment);
      if (!attachmentUrl) {
        alert("Failed to upload attachment to Cloudinary.");
        return;
      }
    }

    const payload = {
      customer: selectedCustomer,
      items,
      notes,
      totalCost,
      attachment:
        attachment && attachmentUrl
          ? {
              url: attachmentUrl,
              name: attachment.name,
              type: attachment.type,
              size: attachment.size,
            }
          : null,
      action: "new",
    };
console.log("payload",payload)
    try {
      const response = await fetch(
        "https://hook.us2.make.com/drl5ee3otd0bpfl98bfl283pfzd2hshr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to send data to webhook");
      // toast.success("Invoice Successfully Created");
      toast.success("Invoice Successfully Created");
      setTimeout(() => {
        navigate("/invoice-list");
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Error sending invoice data.");
    }
    setSaving(false);
  };

  return (
    <>
      <PageMeta title="ServicePros" description="" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] min-h-[600px]">
        <div className="p-4">
          <button
            className="flex items-center text-sm text-gray-700 hover:text-black dark:text-white mb-8"
            onClick={handleRedirect}
          >
            <svg
              className="h-5 w-5 mr-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          {!selectedCustomer ? (
            <div className="rounded-2xl border shadow p-6 min-h-[150px] w-full max-w-lg mx-auto">
              <ReceiptText className="mx-auto mb-2 h-10 w-10 text-gray-600 dark:text-white" />
              <h2 className="mb-1 text-lg font-semibold text-center dark:text-white text-md">
                Create New Invoice
              </h2>
              <p className="mb-4 text-md text-gray-600 text-center dark:text-white ">
                Before we proceed, please select a customer
              </p>

              <input
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search customer..."
                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none dark:text-white"
              />

              {loading && (
                <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Loading...
                </div>
              )}

              {!loading && query.trim() !== "" && (
                <ul className="mt-2 max-h-40 overflow-y-auto rounded-md border bg-white shadow">
                  {filtered.length > 0 ? (
                    filtered.map((cust) => (
                      <li
                        key={cust.CustomerId}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                        onClick={() => handleSelect(cust)}
                      >
                        {cust.CustomerName}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-sm text-gray-500">
                      No results found
                    </li>
                  )}
                </ul>
              )}
            </div>
          ) : (
            <div>
              <div className="p-6 rounded-2xl border  shadow dark:text-white">
                <h2 className="text-md font-semibold mb-3">
                  Customer Information
                </h2>
                <div className="grid grid-cols-2 gap-4 text-md">
                  <p>
                    <span className="font-medium text-sm">Name:</span>{" "}
                    {selectedCustomer.CustomerName}
                  </p>
                  <p>
                    <span className="font-medium text-sm">Address:</span>{" "}
                    {selectedCustomer.Address}
                  </p>
                  <p>
                    <span className="font-medium text-sm">Phone:</span>{" "}
                    {selectedCustomer.PhoneNumber}
                  </p>
                  <p>
                    <span className="font-medium text-sm">Email:</span>{" "}
                    {selectedCustomer.EmailAddress}
                  </p>
                  <p>
                    <span className="font-medium text-sm">Status:</span>{" "}
                    {selectedCustomer.Status}
                  </p>
                  {/* <p>
                    <span className="font-medium text-sm">Created:</span>{" "}
                    {new Date(
                      selectedCustomer.DateCreated
                    ).toLocaleDateString()}
                  </p> */}
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 mb-6">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-center w-full">
                    <div className="flex flex-col items-center relative">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300
                          ${
                            idx < activeStep
                              ? "bg-green-500 border-green-500 text-white"
                              : idx === activeStep
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "bg-white border-gray-300 text-gray-500"
                          }`}
                      >
                        {idx < activeStep ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`mt-2 text-sm ${
                          idx === activeStep
                            ? "font-semibold text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 transition-colors duration-300 ${
                          idx < activeStep ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
       
              <div className="p-6 border rounded-xl  shadow-sm min-h-[200px] dark:text-white">
                {activeStep === 0 && (
                  <div>
                    {/* <input
                      type="text"
                      placeholder="Item Name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-1/2 rounded-md border px-3 py-2 text-md shadow-sm
                        focus:border-blue-500 focus:ring focus:ring-blue-200
                        focus:outline-none dark:text-white mb-4"

                    /> */}

                      <table className="w-full text-sm mb-4">
                        <thead>
                          <tr className="border-b">
                            <th className="p-2 text-left">Item Name</th>
                            <th className="p-2 text-left">Quantity</th>
                            <th className="p-2 text-left">Price</th>
                            <th className="p-2 text-left">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.itemName}
                                  onChange={(e) =>
                                    handleItemChange(idx, "itemName", e.target.value)
                                  }
                                  className="w-full border rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={item.quantity === 0 ? "0" : item.quantity}
                                  onFocus={(e) => {
                                    if (e.target.value === "0") e.target.value = "";
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      handleItemChange(idx, "quantity", 0);
                                    }
                                  }}
                                  onChange={(e) =>
                                    handleItemChange(idx, "quantity", e.target.value)
                                  }
                                  className="w-full border rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={item.price === 0 ? "0" : item.price}
                                  onFocus={(e) => {
                                    if (e.target.value === "0") e.target.value = "";
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      handleItemChange(idx, "price", 0);
                                    }
                                  }}
                                  onChange={(e) =>
                                    handleItemChange(idx, "price", e.target.value)
                                  }
                                  className="w-full border rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="p-2">{item.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>


                    <div className="flex justify-between items-center">
                      <button
                        onClick={addItem}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Add Item
                      </button>
                      <div className="text-right font-semibold text-lg">
                        Total: {totalCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div>
                    <textarea
                      placeholder="Enter your notes here"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none dark:text-white min-h-[120px]"
                    ></textarea>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="flex flex-col items-center justify-center">
                    <label className="cursor-pointer flex flex-col items-center px-4 py-6 bg-gray-100 rounded-lg hover:bg-gray-200">
                      <svg
                        className="w-10 h-10 mb-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0 0l-3-3m3 3l3-3M12 3v9"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        Click to upload file
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {attachmentPreview && (
                      <div className="mt-4">
                        <img
                          src={attachmentPreview}
                          alt="Preview"
                          className="max-h-60 rounded shadow"
                        />
                      </div>
                    )}

                    {attachment && !attachmentPreview && (
                      <p className="mt-2 text-sm text-gray-600">
                        {attachment.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={prevStep}
                  disabled={activeStep === 0}
                  className={`px-2 py-1 rounded shadow  transition-colors text-sm ${
                    activeStep === 0
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-gray-500 text-white hover:bg-gray-600"
                  }`}
                >
                  Back
                </button>

                {activeStep < steps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="px-2 py-1 rounded shadow  bg-blue-500 text-white hover:bg-blue-600 text-sm"
                  >
                    Next
                  </button>
                ) : (
                  <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`px-2 py-1 rounded shadow  text-white text-sm
                        ${saving ? "bg-green-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                    >
                      {saving? "SAVING..." : "SAVE"}
                    </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
