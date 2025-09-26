import { useState, useEffect, ChangeEvent } from "react";
import PageMeta from "../components/common/PageMeta";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface LineItem {
  id: number;
  qty: number;
  price: number;
  productprice: string;
  description: string;
  subtotal: number;
  optional: boolean;
  isDefault?: boolean;
  attachment: File[]; 
}

interface AirtableRecord {
  id: string;
  fields: {
    ClientID: string;
    Name: string;
  };
}

const Quote: React.FC = () => {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: 0,
      qty: 1,
      price: 0,
      productprice: "",
      description: "",
      subtotal: 0,
      optional: false,
      isDefault: true,
      attachment: [], 
    },
  ]);
  

  const navigate = useNavigate();
  const [idCounter, setIdCounter] = useState(1);
  const [jobTitle, setJobTitle] = useState("");
  const [options, setOptions] = useState<AirtableRecord[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [clientMessage, setClientMessage] = useState("");
  const [loading,setLoading]= useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJobTitle(e.target.value);
  };

  const addItem = async () => {
    const cloudName = "doj0vye62";
    const uploadPreset = "Qoute_FileName";
    setLoading(true);
    if (!selected) {
      toast.error("Client selection is required");
      return;
    }

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
                return data.secure_url as string;
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
    };

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
      productprice: "",
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

        const data = await response.json();
        setOptions(data.records as AirtableRecord[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChangeForDropdown = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
  };

  const handleClientMessage = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setClientMessage(e.target.value);
  };

  const handleBack = () => {
    navigate("/quotation-list");
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
        <h2 className="text-xl sm:text-2xl font-bold mr-0 sm:mr-2 dark:text-white">Quote for</h2>

        <select
          id="dropdown"
          className="w-full sm:w-auto font-semibold text-base px-2 py-2 mt-2 sm:mt-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-sans dark:bg-black"
          value={selected}
          onChange={handleChangeForDropdown}
          required
        >
          <option value="">--Choose Client--</option>
          {options.map(item => (
            <option key={item.id} value={item.fields.ClientID}>
              {item.fields.Name}
            </option>
          ))}
        </select>
      </div>
    </div>

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
          <span className="ml-2 text-gray-800"></span>
        </div>
      </div>
    </div>

    {lineItems.map((item) => (
      <div
        key={item.id}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start border-b-[2px] pb-4 mt-6 rounded ${
          item.optional ? 'bg-gray-100 dark:bg-gray-500' : ''
        }`}
      >
        <div>
          {item.optional && <p className="text-xs italic ">Optional</p>}
          <label className="block text-sm font-bold ">Lighting Style</label>
          <input
            type="text"
            className="mt-1 w-full border rounded px-3 py-2"
            value={item.productprice}
            onChange={(e) => updateLineItem(item.id, 'productprice', e.target.value)}
            disabled = {!selected}
          />
        </div>
        <div>
          <label className="block text-sm font-bold ">Description</label>
          <input
            type="text"
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Details"
            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
            disabled = {!selected}
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
          <label className="block text-sm font-bold">Attachment</label>
          <input
  type="file"
  multiple   
  className="mt-1 w-full text-sm text-gray-500 border border-dashed border-gray-300 rounded px-3 py-2 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-sm file:text-gray-700 hover:file:bg-gray-200"
  onChange={(e) => {
    if (e.target.files) {
      updateLineItem(item.id, "attachment", Array.from(e.target.files)); 
    }
  }}
  disabled={!selected}
/>

          <div className="text-right">
           {item.id !== 0 && (
            <button
              onClick={() => handleDeleteLineItem(item.id)}
              className="mt-4 px-4 py-2 bg-red-400 text-white border border-red-400 rounded hover:bg-red-700 hover:border-[1px]"
            >
              Delete
            </button>
          )}
          </div>
        </div>
        <div className="text-right">
        </div>
      </div>
    ))}
    <div className="mt-6 flex flex-wrap gap-2">
      <button
        onClick={() => handleAddLineItem(false)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Add Line Item
      </button>
      <button
        onClick={() => handleAddLineItem(true)}
        className="px-4 py-2 bg-white text-green-600 border border-green-600 rounded hover:bg-green-100"
      >
        + Add Optional Line Item
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
        className={`px-4 py-2 text-white rounded 
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
