import { useState, useEffect, ChangeEvent } from "react";
import PageMeta from "../components/common/PageMeta";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface LineItem {
  id: number;
  qty: number;
  price: number;
  itemName: string;
  description: string;
  subtotal: number;
  optional: boolean;
  isDefault?: boolean;
  attachment: File[];
}

interface AirtableRecord {
  id: string;
  fields: {
    CustomerId: string;
    CustomerName: string;
  };
}

const Quote: React.FC = () => {
  // const [lineItems, setLineItems] = useState<LineItem[]>([
  //   {
  //     id: 0,
  //     qty: 1,
  //     price: 0,
  //     itemName: "",
  //     description: "",
  //     subtotal: 0,
  //     optional: false,
  //     isDefault: true,
  //     attachment: [],
  //   },
  // ]);
const [lineItems, setLineItems] = useState<LineItem[]>([]);


  const navigate = useNavigate();
  const [idCounter, setIdCounter] = useState(1);
  const [jobTitle, setJobTitle] = useState("");
  const [options, setOptions] = useState<AirtableRecord[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [clientMessage, setClientMessage] = useState("");
  const [loading,setLoading]= useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({
    fullname: "",
    email: "",
    address: "",
    phone: "",
  });
  const [loadingClient, setLoadingClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
const [showDropdown, setShowDropdown] = useState(false);

const filteredOptions = options.filter((item) =>
  item.fields.CustomerName.toLowerCase().includes(searchTerm.toLowerCase())
);
useEffect(() => {
  const handleClickOutside = () => {
    setShowDropdown(false);
  };
  document.addEventListener("click", handleClickOutside);
  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJobTitle(e.target.value);
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const addItem = async () => {
    const cloudName = "doj0vye62";
    const uploadPreset = "Qoute_FileName";
    setLoading(true);
    if (!selected) {
      toast.error("Client selection is required");
      return;
    }

    const AttachmentBase64: string[] = [];

    const uploadedItems = await Promise.all(
      lineItems.map(async (item) => {
        if (item.attachment && item.attachment.length > 0) {
          try {
            const uploadedFiles = await Promise.all(
              item.attachment.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", uploadPreset);

                const res = await fetch(
                  `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                  {
                    method: "POST",
                    body: formData,
                  }
                );

                const data = await res.json();
                const base64 = await toBase64(file);
                // return data.secure_url as string;
                AttachmentBase64.push(base64 as string);
                return {
                  fileName: file.name,
                  cloudinaryUrl: data.secure_url as string,
                  // base64: base64,
                };
              })
            );

            return {
              ...item,
              attachment: uploadedFiles,
     
            };
          } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            toast.error("Image upload failed");
            return item;
          }
        } else {
          return item;
        }
      })
    );


    const finalQuote = {
      Items: uploadedItems,
      total: quoteTotal,
      jobTitle: jobTitle,
      ClientId: selected,
      ClientMessage: clientMessage,
      userId: getToken()?.ID,
      AttachmentBase64
    };

console.log("finalquote",finalQuote)
    const response = await fetch(
      "https://hook.us2.make.com/bv2ju7vw5t8ttf241hooe12z5qpueb8u",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
        },
        body: JSON.stringify(finalQuote),
      }
    );

    if (response.ok) {

      toast.success("Quote Saved Successfully!");
      setTimeout(() => {
        navigate("/quotation-list");
      }, 1000);
    } else {
      toast.error("Error sending quote");
    }
    setLoading(false);
  };

  const handleAddLineItem = (isOptional = false) => {
    const newItem: LineItem = {
      id: idCounter,
      qty: 1,
      price: 0,
      itemName: "",
      description: "",
      subtotal: 0,
      optional: isOptional,
      attachment: [],
    };

    setLineItems([...lineItems, newItem]);
    setIdCounter(idCounter + 1);
  };

  const updateLineItem = (
    id: number,
    key: keyof LineItem,
    value: string | number | File | File[] | null
  ) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;

        const updatedItem = { ...item, [key]: value };

        if (key === "qty" || key === "price") {
          const qty = key === "qty" ? (value as number) : item.qty;
          const price = key === "price" ? (value as number) : item.price;
          updatedItem.subtotal = qty * price;
        }

        return updatedItem;
      })
    );
  };


  const quoteTotal = lineItems.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const handleDeleteLineItem = (id: number) => {
    const updatedItems = lineItems.filter((item) => item.id !== id);
    setLineItems(updatedItems);
  };

  useEffect(() => {
    const fetchData = async () => {
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

        const data = await response.json();
        setOptions(data.records as AirtableRecord[]);
        console.log("data",data.records as AirtableRecord[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // const handleChangeForDropdown = (e: ChangeEvent<HTMLSelectElement>) => {
  //   setSelected(e.target.value);
  // };

  const handleClientMessage = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setClientMessage(e.target.value);
  };

  const handleBack = () => {
    navigate("/quotation-list");
  };
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

  const handleAddClient = async () => {
    if (!newClient.fullname.trim()) {
      toast.error("Full Name is required");
      return;
    }
    const fullname = newClient.fullname.trim();
    const email = newClient.email.trim();
    const address = newClient.address.trim();
    const phone = newClient.phone.trim();
  
    if (!fullname) {
      toast.error("Full Name is required");
      return;
    }
  
    if (!email) {
      toast.error("Email is required");
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
  
    if (!address) {
      toast.error("Address is required");
      return;
    }
  
    if (!phone) {
      toast.error("Phone Number is required");
      return;
    }
  
    // const phoneRegex = /^\+?\d{7,15}$/;
    // if (!phoneRegex.test(phone)) {
    //   toast.error("Please enter a valid phone number");
    //   return;
    // }
  
    setLoadingClient(true);
  
    try {
      const response = await fetch(
        "https://hook.us2.make.com/ljh1e6lm1vehjzy9h9xu6ou3lvlxss6g",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
          },
          body: JSON.stringify({
            FullName: newClient.fullname,
            Email: newClient.email,
            Address: newClient.address,
            PhoneNumber: newClient.phone,
            Action: "newClient"
          }),
        }
      );
  
      if (response.ok) {
        toast.success("Client added successfully!");
        window.location.reload();
        setShowModal(false);
        setNewClient({ fullname: "", email: "", address: "", phone: "" });
      } else {
        toast.error("Failed to submit client data");
      }
    } catch (error) {
      console.error("Error submitting client:", error);
      toast.error("Error sending data");
    }
  
    setLoadingClient(false);
   

  };

  return (
    <>
      <PageMeta
        title="ServicePros"
        description=""
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendars">
           <div className=" min-h-screen p-4 sm:p-6 font-sans">
            <div className="max-w-6xl mx-auto  rounded-xl shadow-md p-4 sm:p-6 dark:text-white">
            <div className="flex justify-start mb-4 ">
             <button className="flex items-center text-sm text-gray-700 hover:text-black dark:text-white" onClick={handleBack}>
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
            </button>
        </div>
        

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full">
                  <h2 className="text-xl sm:text-2xl font-bold mr-0 sm:mr-2 dark:text-white">
                    Quote for
                  </h2>

                  <div className="flex items-center w-full sm:w-auto gap-2">
                  <div className="relative w-full sm:w-72">
                        <input
                          type="text"
                          placeholder="--Choose Client--"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                          }}
                          onFocus={() => setShowDropdown(true)}
                          className="w-full font-semibold text-base px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-black dark:text-white"
                        />

                        {showDropdown && (
                          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-md dark:bg-gray-800 dark:border-gray-700">
                            {filteredOptions.length > 0 ? (
                              filteredOptions.map((item) => (
                                <li
                                  key={item.id}
                                  className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm dark:text-white"
                                  onClick={() => {
                                    setSelected(item.fields.CustomerId);
                                    setSearchTerm(item.fields.CustomerName); 
                                    setShowDropdown(false);
                                  }}
                                >
                                  {item.fields.CustomerName}
                                </li>
                              ))
                            ) : (
                              <li className="px-3 py-2 text-gray-500 dark:text-gray-300 text-sm">
                                No results found
                              </li>
                            )}
                          </ul>
                        )}
                      </div>



                    <button
                      onClick={() => setShowModal(true)}
                      className="px-2 py-1 bg-white text-green-600 border border-green-600 rounded hover:bg-green-100"
                    >
                      + New Client
                    </button>
                  </div>
                </div>
              </div>

  
{showModal && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
    onClick={(e) => e.stopPropagation()} 
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



    <div className="flex flex-col md:flex-row gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-300">
      <div className="md:pr-4 w-full md:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Job Title</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter job title"
          onChange={handleChange}
          disabled = {!selected}
        />
      </div>

      <div className="md:pl-4 pt-4 md:pt-0 w-full md:w-1/2">
        <div className='font-bold text-sm mb-1'>Quote Details:</div>
        <div>
          <span className="text-sm font-semibold text-gray-600 dark:text-white">Salesperson:</span>
          <span className="ml-2 text-gray-800">{getToken()?.FullName}</span>
        </div>
      </div>
    </div>

    {lineItems.map((item) => (
      <div
        key={item.id}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start border-b-[2px] pb-4 mt-6 rounded pt-5 p-2 ${
          item.optional ? 'bg-gray-100 dark:bg-gray-500' : ''
        }`}
      >
<div>
  {/* {item.optional && <p className="text-xs italic ">Optional</p>} */}

  <label className="block text-sm font-bold">Lighting Style</label>
  <input
    type="text"
    className="mt-1 w-full border rounded px-3 py-2"
    value={item.itemName}
    onChange={(e) => updateLineItem(item.id, "itemName", e.target.value)}
    disabled={!selected}
  />
</div>

<div>
  <label className="block text-sm font-bold">Description</label>
  <textarea
    className="mt-1 w-full border rounded px-3 py-2 h-24 resize-none"
    placeholder="Details"
    onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
    disabled={!selected}
  />
</div>


        <div>
          <label className="block text-sm font-bold ">Price</label>
          <input
            type="number"
            value={item.price}
            min="0"
            className="mt-1 w-full border rounded px-3 py-2"
            onChange={(e) => updateLineItem(item.id, 'price', parseFloat(e.target.value))}
            disabled = {!selected}
          />
        </div>
        <div>

              <label className="block text-sm font-bold">Images</label>
              <input
                type="file"
                multiple
                className="mt-1 w-full text-sm text-gray-500 border border-dashed border-gray-300 rounded px-3 py-2
                          file:mr-2 file:py-1 file:px-3 file:rounded file:border-0
                          file:bg-gray-100 file:text-sm file:text-gray-700 hover:file:bg-gray-200"
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);

                    if (files.length > 3) {
                      toast.error("You can only upload up to 3 files.");
                      e.target.value = "";
                      return;
                    }

                    updateLineItem(item.id, "attachment", files);
                  }
                }}
                disabled={!selected}
              />


          <div className="text-right">
           {/* {item.id !== 0 && (
            <button
              onClick={() => handleDeleteLineItem(item.id)}
              className="mt-4 px-4 py-2 bg-red-400 text-white border border-red-400 rounded hover:bg-red-700 hover:border-[1px]"
            >
              Delete
            </button>
          )} */}
          <button
            onClick={() => handleDeleteLineItem(item.id)}
            className="mt-4 px-2 py-1 bg-red-400 text-white border border-red-400 rounded hover:bg-red-700 hover:border-[1px]"
          >
            Delete
          </button>
          </div>
        </div>
        <div className="text-right">
        </div>
      </div>
    ))}
    <div className="mt-6 flex flex-wrap gap-2">
      {/* <button
        onClick={() => handleAddLineItem(false)}
        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Add Line Item
      </button> */}
      <button
        onClick={() => handleAddLineItem(true)}
        className="px-2 py-1 bg-white text-green-600 border border-green-600 rounded hover:bg-green-100"
      >
        + Add Optional Item
      </button>
    </div>
    <div className="mt-6 text-right text-xl font-semibold">
      Total: ${quoteTotal.toFixed(2)}
    </div>
    <div className="mt-4 mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Client Message
      </label>
      <textarea
        rows={4}
        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter message"
        onChange={handleClientMessage}
        disabled = {!selected}
      ></textarea>
    </div>
    <div className="text-left">
    <button
        onClick={addItem}
        disabled={loading}
        className={`px-2 py-1 text-white rounded
          ${loading ? "bg-sky-400 cursor-not-allowed" : "bg-sky-500 hover:bg-sky-700"}`}
      >
        {loading ? "SAVING..." : "SAVE"}
      </button>
    </div>
  </div>
</div>
        </div>
      </div>
    </>
  );
};

export default Quote;
