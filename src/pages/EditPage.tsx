import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

interface QuoteFields {
  ItemName: string;
  Description: string;
  Quantity: number;
  UnitPrice: number;
  IsOptional: number;
  Attachments?: { url: string }[];
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
  CustomerName?: string;
}



const EditPage: React.FC = () => {
  const location = useLocation();
  const { item, CustomerName } = (location.state as LocationState) || {};
  const [quoteData, setQuoteData] = useState<QuoteRecord[]>([]);
  const [newItems, setNewItems] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  const [popupImage, setPopupImage] = useState<string | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

  const cloudName = "doj0vye62";
  const uploadPreset = "Qoute_FileName";

  useEffect(() => {
    const fetchQuotationInfo = async () => {
      try {
        if (!item?.quoteId) return;

        const formula = `{QuoteID} = '${item.quoteId}'`;
        const url = `https://api.airtable.com/v0/appxmoiNZa85I7nye/tblESRF794GfZbS9S?filterByFormula=${encodeURIComponent(
          formula
        )}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`,
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
          ItemName: "",
          Description: "",
          Quantity: 1,
          UnitPrice: 0,
          IsOptional: isOptional ? 1 : 0,
          Attachments: [],
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
      setUpdating(true);

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
                  Attachments: [
                    ...(item.fields.Attachments || []),
                    { url: data.secure_url },
                  ],
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
            "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
          },
          body: JSON.stringify(uploadedItems),
        }
      );

      if (response.ok) {
        toast.success("Quote Updated Successfully!");
        setTimeout(() => {
          navigate("/quotation-list");
        }, 1000);
      } else {
        toast.error("Update Error");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
    setUpdating(false);
  };

  const handleRedirect = () => {
    navigate(`/quotation-list`);
  };

  const openPopup = (url: string) => {
    setPopupImage(url);
    setTimeout(() => setPopupVisible(true), 10);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setTimeout(() => setPopupImage(null), 300); 
  };

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  const getToken = () => {

    const storedData = localStorage.getItem("data");
  
    if (!storedData) return null; 
  
    try {
      const parsed = JSON.parse(storedData);
  
      return {
        ID: parsed.ID,
        UserName: parsed.UserName,
        FullName: parsed.FullName,
        UserType: parsed.UserType,
        Status: parsed.Status,
     
      };
    } catch (e) {
      console.error("Invalid JSON in localStorage for data", e);
      return null;
    }
  };
  return (
    <>
      <PageMeta title="ServicePros" description="" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {loading ? (
            <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Please wait...
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
        <div className="custom-calendars">
          <div className=" min-h-screen p-4 sm:p-6 font-sans">
            <div className="max-w-6xl mx-auto  rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex justify-start">
                <button
                  className="flex items-center text-sm text-gray-700 hover:text-black mb-4"
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
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full">
                  <h2 className="text-xl sm:text-2xl font-bold mr-0 sm:mr-2 dark:text-white">
                    Quote for
                  </h2>
                  <select
                    className="w-full sm:w-auto font-semibold text-base px-2 py-2 mt-2 sm:mt-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:text-white"
                    value={CustomerName || ""}
                    disabled
                  >
                    <option value="">{CustomerName || "--Choose Client--"}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-300 dark:text-white">
                <div className="md:pr-4 w-full md:w-1/2 ">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                    Job Title
                  </label>
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
                    <span className="text-sm font-semibold text-gray-600 dark:text-white">
                      Salesperson:
                    </span>
                    <span className="ml-2 text-gray-800">
                      {getToken()?.FullName || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-b-[2px] pb-4 dark:text-white">
                {[...quoteData, ...newItems].map((record, idx) => {
                  const fields = record.fields;
                  const isOptional = fields?.IsOptional === 1;
                  const isNew = record.id.toString().startsWith("1");

                  return (
                    <div
                      key={record.id}
                      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start p-4 rounded ${
                        isOptional ? "bg-gray-100 dark:bg-gray-500 " : ""
                      }`}
                    >
                      <div>
                        {isOptional && (
                          <div className="text-xs text-gray-500 font-semibold mb-1 mt-[-15px] italic">
                            Optional
                          </div>
                        )}
                        <label className="block text-sm font-bold ">
                          Item Name
                        </label>
                        <input
                          type="text"
                          className="mt-1 w-full border rounded px-3 py-2"
                          value={fields["Item Name"] || ""}
                          onChange={(e) =>
                            isNew &&
                            handleInputChange(
                              idx - quoteData.length,
                              "ItemName",
                              e.target.value
                            )
                          }
                          readOnly={!isNew}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold ">
                          Description
                        </label>
                        <input
                          type="text"
                          className="mt-1 w-full border rounded px-3 py-2"
                          value={fields["Description"] || ""}
                          onChange={(e) =>
                            isNew &&
                            handleInputChange(
                              idx - quoteData.length,
                              "Description",
                              e.target.value
                            )
                          }
                          readOnly={!isNew}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold ">Price</label>
                        <input
                          type="number"
                          className="mt-1 w-full border rounded px-3 py-2"
                          value={fields["Unit Price"] || 0}
                          onChange={(e) =>
                            isNew &&
                            handleInputChange(
                              idx - quoteData.length,
                              "UnitPrice",
                              e.target.value
                            )
                          }
                          readOnly={!isNew}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold">
                          Attachment
                        </label>

                        <div className="flex flex-wrap gap-2 mt-1">
                          {fields.Attachments &&
                            fields.Attachments.length > 0 &&
                            fields.Attachments.map(
                              (att: { url: string }, i: number) => (
                                <div
                                  key={i}
                                  className="relative w-10 h-10 cursor-pointer"
                                  onClick={() => openPopup(att.url)}
                                >
                                  <img
                                    src={att.url}
                                    alt={`Attachment ${i}`}
                                    className="w-10 h-10  object-cover rounded border"
                                  />
                                  <button
                                    type="button"
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation(); 
                                      const allItems = [...quoteData, ...newItems];
                                      const currentAttachments =
                                        allItems[idx].fields.Attachments || [];
                                      const updatedAttachments =
                                        currentAttachments.filter(
                                          (_: any, j: number) => j !== i
                                        );
                                      allItems[idx].fields.Attachments =
                                        updatedAttachments;

                                      const updatedQuoteData = allItems.slice(
                                        0,
                                        quoteData.length
                                      );
                                      const updatedNewItems = allItems.slice(
                                        quoteData.length
                                      );
                                      setQuoteData(updatedQuoteData);
                                      setNewItems(updatedNewItems);
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              )
                            )}

                       <label className="flex items-center justify-center w-10 h-10 border-2 border-dashed rounded cursor-pointer hover:bg-gray-100">
                        <span className="text-gray-500 text-2xl">+</span>
                        <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const allItems = [...quoteData, ...newItems];
                            const targetItem = allItems[idx];

                            if (!targetItem.fields.Attachments) {
                              targetItem.fields.Attachments = [];
                            }

                  
                            const remainingSlots = 3 - targetItem.fields.Attachments.length;
                            if (files.length > remainingSlots) {
                              toast.error(`You can only add ${remainingSlots} more attachment(s).`);
                              return;
                            }

                            Array.from(files).forEach((file) => {
                              targetItem.fields.Attachments!.push({
                                url: URL.createObjectURL(file),
                              });

                              targetItem.attachment = file;
                            });

                            const updatedQuoteData = allItems.slice(0, quoteData.length);
                            const updatedNewItems = allItems.slice(quoteData.length);
                            setQuoteData(updatedQuoteData);
                            setNewItems(updatedNewItems);
                          }
                        }}
                      />

                      </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleAddItem(false)}
                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  + Add Item
                </button>
                <button
                  onClick={() => handleAddItem(true)}
                  className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                >
                  + Add Optional Item
                </button>
              </div>

              <div className="mt-6 text-right text-xl font-semibold dark:text-white">
                Total: ${totalPrice}
              </div>
              <div className="mt-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                  Client Message
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-md p-2 dark:text-white"
                  placeholder="Enter message"
                ></textarea>
              </div>

              <div className="text-left">
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className={`px-2 py-1 text-white rounded text-sm 
          ${
            updating
              ? "bg-sky-400 cursor-not-allowed"
              : "bg-sky-500 hover:bg-sky-700"
          }`}
                >
                  {updating ? "UPDATING..." : "UPDATE"}
                </button>
              </div>
            </div>
          </div>
        </div>
            )}
      </div>

      {popupImage && (
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
            popupVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closePopup}
        >
          <div
            className={`relative transform transition-all duration-300 ease-out ${
              popupVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()} 
          >
            <img
              src={popupImage}
              alt="Popup"
              className="max-w-[90vw] max-h-[80vh] rounded shadow-lg "
            />
            
            <button
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-700  rounded-full"
              onClick={closePopup}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EditPage;
