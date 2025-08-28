import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

// Types
interface QuoteFields {
  "Item Name": string;
  Description: string;
  Quantity: number;
  "Unit Price": number;
  IsOptional: number;
  Attachments?: { url: string }[];

  // 👇 this tells TS "any key of QuoteFields can be string | number | object"
  [key: string]: any;
}

interface QuoteRecord {
  id: string | number;
  fields: QuoteFields;
  attachment?: File | null;
  salesperson?: string;
}

interface LocationState {
  item?: {
    id: string;
    quoteId?: string;
    clientID?: string;
    jobTitle?: string;
    quoteLink?: string;
    status?: string;
    salesperson?: string;
  };
  clientName?: string;
}

const EditPage: React.FC = () => {
  const location = useLocation();
  const { item, clientName } = (location.state as LocationState) || {};
  const [quoteData, setQuoteData] = useState<QuoteRecord[]>([]);
  const [newItems, setNewItems] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const cloudName = "doj0vye62";
  const uploadPreset = "Qoute_FileName";

  useEffect(() => {
    const fetchQuotationInfo = async () => {
      try {
        if (!item?.quoteId) return;

        const formula = `{QuoteID} = '${item.quoteId}'`;
        const url = `https://api.airtable.com/v0/app4pNHoxT8aj9vzJ/tblYVFWQZUwxenmiw?filterByFormula=${encodeURIComponent(
          formula
        )}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer patAFsT3g1wFUFyk8.1c95d3e5a6b3062dc4c13f144f5dcd70aa89b1ecca4ff68880721b10640b08bf`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setQuoteData(data.records);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (item?.id) {
      fetchQuotationInfo();
    }
  }, [item]);

  const handleAddItem = (isOptional = false) => {
    setNewItems([
      ...newItems,
      {
        id: Date.now(),
        fields: {
          "Item Name": "",
          Description: "",
          Quantity: 1,
          "Unit Price": 0,
          IsOptional: isOptional ? 1 : 0,
        },
        attachment: null,
      },
    ]);
  };

const handleInputChange = (
  index: number,
  field: keyof QuoteFields,
  value: string | number
) => {
  const updated = [...newItems];

  if (field === "Quantity" || field === "Unit Price" || field === "IsOptional") {
    (updated[index].fields[field] as number) = Number(value) || 0;
  } else {
    (updated[index].fields[field] as string) = value as string;
  }

  setNewItems(updated);
};


  const totalPrice = [...quoteData, ...newItems].reduce(
    (acc, record) =>
      acc +
      (record.fields?.Quantity || 0) * (record.fields?.["Unit Price"] || 0),
    0
  );

  const handleUpdate = async () => {
    try {
      const lineItems = [...quoteData, ...newItems];

      const uploadedItems = await Promise.all(
        lineItems.map(async (item) => {
          if (item.attachment) {
            const formData = new FormData();
            formData.append("file", item.attachment);
            formData.append("upload_preset", uploadPreset);

            try {
              const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                {
                  method: "POST",
                  body: formData,
                }
              );

              const data = await res.json();

              return {
                ...item,
                fields: {
                  ...item.fields,
                  Attachments: [{ url: data.secure_url }],
                },
              };
            } catch (error) {
              console.error("Cloudinary Upload Error:", error);
              return item;
            }
          } else {
            return item;
          }
        })
      );

      const response = await fetch(
        "https://hook.us2.make.com/58fjj1kj4kdwne8v4d0lcx2labniduin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(uploadedItems),
        }
      );

      if (response.ok) {
        toast.success("Quote Updated Successfully!");
      } else {
        toast.error("Update Error");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleRedirect = () => {
    navigate(`/quotation-list`);
  };

  if (loading) {
    return <div>Loading...</div>; 
  }
  return (
    <>
      <PageMeta
        title="React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendars">
             <div className="bg-gray-100 min-h-screen p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-4 sm:p-6">       
      <div className="flex justify-start">
         <button className="flex items-center text-sm text-gray-700 hover:text-black mb-4" onClick={handleRedirect}>
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
            </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center w-full">
            <h2 className="text-xl sm:text-2xl font-bold mr-0 sm:mr-2">Quote for</h2>
            <select
              className="w-full sm:w-auto font-semibold text-base px-2 py-2 mt-2 sm:mt-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={clientName || ""}
              disabled
            >
              <option value="">{clientName || "--Choose Client--"}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-300">
          <div className="md:pr-4 w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
              value={item?.jobTitle || ""}
              readOnly
            />
          </div>
          <div className="md:pl-4 pt-4 md:pt-0 w-full md:w-1/2">
            <div className="font-bold text-sm mb-1">Quote Details:</div>
            <div>
              <span className="text-sm font-semibold text-gray-600">Salesperson:</span>
              <span className="ml-2 text-gray-800">{item?.salesperson || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4 border-b-[2px] pb-4">
          {[...quoteData, ...newItems].map((record, idx) => {
            const fields = record.fields;
            const isOptional = fields?.IsOptional === 1;
            const isNew = record.id.toString().startsWith("1");

            return (
              <div
                key={record.id}
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start p-4 rounded ${
                  isOptional ? "bg-gray-100" : ""
                }`}
              >
                <div>
                  {isOptional && (
                    <div className="text-xs text-gray-500 font-semibold mb-1 mt-[-15px] italic">Optional</div>
                  )}
                  <label className="block text-sm font-bold text-gray-700">Item Name</label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={fields["Item Name"] || ""}
                    onChange={(e) =>
                      isNew &&
                      handleInputChange(idx - quoteData.length, "Item Name", e.target.value)
                    }
                    readOnly={!isNew}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700">Description</label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={fields["Description"] || ""}
                    onChange={(e) =>
                      isNew &&
                      handleInputChange(idx - quoteData.length, "Description", e.target.value)
                    }
                    readOnly={!isNew}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700">Price</label>
                  <input
                    type="number"
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={fields["Unit Price"] || 0}
                    onChange={(e) =>
                      isNew &&
                      handleInputChange(idx - quoteData.length, "Unit Price", e.target.value)
                    }
                    readOnly={!isNew}
                  />
                </div>
                <div>
                <label className="block text-sm font-bold text-gray-700">Attachment</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 w-full border rounded px-3 py-2 file:bg-gray-200 file:text-gray-700 file:text-gray-700 hover:file:bg-gray-300 " 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0]; 
                        if (file) {
                        const allItems = [...quoteData, ...newItems];
                        allItems[idx].attachment = file;
                        const updatedQuoteData = allItems.slice(0, quoteData.length);
                        const updatedNewItems = allItems.slice(quoteData.length);
                        setQuoteData(updatedQuoteData);
                        setNewItems(updatedNewItems);
                        }
                    }}
                    />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => handleAddItem(false)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Add Item
          </button>
          <button
            onClick={() => handleAddItem(true)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            + Add Optional Item
          </button>
        </div>

        <div className="mt-6 text-right text-xl font-semibold">
          Total: ${totalPrice}
        </div>

        <div className="mt-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Message</label>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter message"
          ></textarea>
        </div>

        <div className="text-left">
          <button
            className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-700"
            onClick={handleUpdate}
          >
            UPDATE
          </button>
        </div>
      </div>
    </div>
        </div>
      </div>
    </>
  );
};

export default EditPage;
