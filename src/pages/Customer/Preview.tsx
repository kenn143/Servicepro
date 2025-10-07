import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

interface QuotationItem {
  id: string;
  quoteId: string;
  jobTitle: string;
  product: string;
  attachment: string;
  qty: number;
  price: number;
  optional: boolean;
  status: string | null;
  quoteNumber: string;
  clientID: number;
  datecreated: string;
}

interface CustomerRecord {
  id: string;
  fields: {
    ItemName?: string;
    Description?: string;
    Quantity?: number;
    UnitPrice?: number;
    IsOptional?: number;
    Attachments?: { url: string; thumbnails?: { small?: { url: string } } }[];
    Name?: string;
    "Email Address"?: string;
    "Phone Number"?: string;
    Address?: string;
  };
}
const Preview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [initialData, setInitialData] = useState<QuotationItem[]>([]);
  const [checkedOptionals, setCheckedOptionals] = useState<Record<string, boolean>>({});
  const [jobTitle, setJobTitle] = useState<string>("");
  const [customerList, setCustomerList] = useState<CustomerRecord[]>([]);
  const [clientName, setClientName] = useState<string>("");
  const [emailaddress, setEmailAddress] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [, setQuoteNumber] = useState<string>("");
  const [datecreated, setDateCreated] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [recordId, setRecordId] = useState<string>("");
  const [quotationRecordId, setQuotationRecordId] = useState<string>("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false); 
  const [requestMessage, setRequestMessage] = useState<string>("");


  const handleRequestChanges = async () => {
    if (!requestMessage.trim()) {
      toast.error("Please enter your message before submitting.");
      return;
    }

    // const requestPayload = {
    //   quoteId: initialData[0]?.quoteId,
    //   clientName,
    //   jobTitle,
    //   message: requestMessage,
    //   action: "Request Changes",
    // };

    // try {
    //   const response = await fetch("https://hook.us2.make.com/415jpaj3alwy9nceagf5rg7oprt8s6v6", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(requestPayload),
    //   });

    //   if (response.ok) {
    //     toast.success("Request sent successfully!");
    //     setRequestMessage(""); // clear message
    //     setIsRequestModalOpen(false); // close modal
    //   } else {
    //     toast.error("Failed to send request.");
    //   }
    // } catch (error) {
    //   console.error("Error sending request:", error);
    //   toast.error("Something went wrong.");
    // }
  };

 

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const url = `https://api.airtable.com/v0/appxmoiNZa85I7nye/tblbF4N9Ixi3mRFKW/${id}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization:
              "Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const record = await response.json();

        const item: QuotationItem = {
          id: record.id,
          quoteId: record.fields["Quote ID"] || "",
          jobTitle: record.fields["Job Title"] || "",
          product: record.fields["Product"] || "Unknown Product",
          attachment: record.fields["Attachment"] ? record.fields["Attachment"][0].url : "",
          qty: record.fields["Quantity"] || 1,
          price: record.fields["Unit Price"] || 0,
          optional: record.fields["Optional"] || false,
          status: record.fields["Status"] || null,
          quoteNumber: record.fields["Quote Number"] || "",
          clientID: record.fields["ClientID"] || 0,
          datecreated: record.fields["Date Created"] || "",
        };
        QuotationInfoFetch(item.quoteId);
        CustomerInfoFetch(item.clientID);

        setInitialData([item]);
        setJobTitle(item.jobTitle);
        setQuoteNumber(item.quoteNumber);
        setDateCreated(item.datecreated);
        setStatus(item.status);
        setQuotationRecordId(item.id);

        if (item.optional) setCheckedOptionals({ [item.id]: true });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const QuotationInfoFetch = async (id: string): Promise<any> => {
    try {
           const formula = `{QuoteID} = ${id}`; 
      const url = `https://api.airtable.com/v0/appxmoiNZa85I7nye/tblESRF794GfZbS9S?filterByFormula=${encodeURIComponent(formula)}`;
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setCustomerList(data.records);
      setLoading(false);
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

  const CustomerInfoFetch = async (id: number): Promise<any> => {
    if (!id) {
      console.error("Invalid ID passed to CustomerInfoFetch");
      return null;
    }

    try {
     const formula = `{CustomerId} = ${id}`; 
    const url = `https://api.airtable.com/v0/appxmoiNZa85I7nye/tbl5zFFDDF4N3hYv0?filterByFormula=${encodeURIComponent(formula)}`;
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609", 
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
   
      const name = data.records[0]?.fields?.CustomerName || "";
      const email = data.records[0]?.fields?.["EmailAddress"] || "";
      const phone = data.records[0]?.fields?.["PhoneNumber"] || "";
      const addr = data.records[0]?.fields?.["Address"] || "";
      const recordId =data.records[0]?.id

      setClientName(name);
      setEmailAddress(email);
      setPhoneNumber(phone);
      setAddress(addr);
      setRecordId(recordId);

     
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    } finally{
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setCheckedOptionals((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getTotal = (): number => {
    return customerList.reduce((sum, item) => {
      const qty = item.fields["Quantity"] || 0;
      const price = item.fields["UnitPrice"] || 0;
      const isOptional = item.fields["IsOptional"] === 1;

      if (!isOptional || checkedOptionals[item.id]) {
        return sum + qty * price;
      }
      return sum;
    }, 0);
  };

  const handleApproved = async (): Promise<void> => {
    let quotation = {
      quotationDetails: customerList,
      jobTitle,
      total: getTotal(),
      customerId: recordId,
      quotationId: quotationRecordId,
      approved: 1,
    };

    const response = await fetch("https://hook.us2.make.com/i4kvebfqqozi87eh53lcd38nbamy7l8e", {
      method: "POST",
      headers: { "Content-Type": "application/json",
                 "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
       },
      body: JSON.stringify(quotation),
    });

    if (response.ok) {
       toast.success("Approved");
    } else {
      toast.error("Error");
    }
  };

  const openImageModal = (url: string) => {
    setModalImage(url);
    setTimeout(() => setIsZoomed(true), 100);
  };

  const closeImageModal = () => {
    setIsZoomed(false);
    setTimeout(() => setModalImage(null), 200);
  };

  return (
 <>
      <PageMeta
        title="ServicePros"
        description=""
      />
     
       
    <div className="min-h-screen  font-sans p-6 mt-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2  rounded-2xl shadow p-2 flex flex-col space-y-6">
        <div className="flex justify-center md:justify-end">
        <img
            className="w-36 h-auto sm:w-20 md:w-36 lg:w-36 object-contain"
            src="./images/Media.PNG"
            alt="Logo"
          />
          </div>

          <div className="flex flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm font-semibold dark:text-white">Quote # {initialData[0]?.quoteNumber}</p>
              <p className="font-sans text-2xl font-bold text-blue-600">{clientName}</p>
              <p className="font-semibold text-xs text-gray-500">{emailaddress}</p>
              <p className="font-semibold text-xs text-gray-500">{phoneNumber}</p>
              <p className="font-semibold text-xs text-gray-500">{address}</p>
            </div>



            <div className="flex flex-col items-end space-y-2">
            <button
              disabled
              className={`flex items-center gap-2 px-4 py-1 rounded-xl text-sm font-medium shadow cursor-default 
                ${
                  status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : status === "Waiting for Approval"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
            >
              {status === null ? (
                "Loading..."
              ) : status === "Pending" ? (
                <>⭕ Awaiting Response</>
              ) : status === "Approved" ? (
                <>✔️ Approved</>
              ) : status === "Waiting for Approval" ? (
                <>🕒 Waiting for Approval</>
              ) : (
                <>❔ Unknown</>
              )}
            </button>


              <div className="flex justify-end space-x-2 items-baseline">
                <p className="text-sm dark:text-white">Sent on: </p>
                <p className="font-semibold text-lg dark:text-white">{datecreated|| "N/A"}</p>
              </div>
            </div>
          </div>



          <div className="w-full overflow-x-hidden">
        
  <table className="w-full table-fixed border-collapse border-b-4 text-md">
    <thead>
      <tr className=" dark:text-white">
        <th className="border px-1 py-2 text-center w-[20%] text-sm">Selection</th>
        <th className="border px-1 py-2 text-center w-[30%] text-sm">Lighting Style</th>
        <th className="border px-1 py-2 text-center w-[25%] text-sm">Images</th>
        <th className="border px-1 py-2 text-center w-[25%] text-sm">Price</th>
      </tr>
    </thead>
    <tbody>
      {customerList.map((item) => (
        <tr key={item.id} className="hover:bg-gray-50">
          <td className="border px-1 py-2 text-center">
            {item.fields["IsOptional"] === 1 && (
              <input
                type="checkbox"
                checked={checkedOptionals[item.id] || false}
                onChange={() => handleCheckboxChange(item.id)}
              />
            )}
          </td>
          <td className="border px-1 py-2 break-words text-sm dark:text-white">
              <div>{item.fields["ItemName"]}</div>
              {item.fields["Description"] && (
                <div className="text-xs dark:text-white">( {item.fields["Description"]} )</div>
              )}
            </td>
            <td className="border px-1 py-2 text-center">
              {item.fields.Attachments && item.fields.Attachments.length > 0 ? (
                <div className="flex gap-2 justify-center">
                  {item.fields.Attachments.map((attachment, index) => (
                    <img
                      key={index}
                      src={attachment.thumbnails?.small?.url || attachment.url}
                      alt={`Attachment ${index + 1}`}
                      className="w-10 h-10 object-cover rounded shadow cursor-pointer"
                      onClick={() => openImageModal(attachment.url)}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-sm dark:text-white">No Image</span>
              )}
        </td>

          <td className="border px-1 py-2 text-center text-sm dark:text-white">
            ${item.fields["UnitPrice"]?.toLocaleString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
    

  {modalImage && (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
    onClick={closeImageModal}
  >
    <div
      className="rounded-lg p-2 max-w-[90%] max-h-[90%] relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={closeImageModal}
        className="absolute -top-4 -right-4  hover:bg-red-700 text-white rounded-full p-2 transition-colors backdrop-blur-sm z-10 bg-red-500"
        aria-label="Close modal"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <img
        src={modalImage}
        alt="Full size"
        className={`max-w-full max-h-[80vh] object-contain rounded transition-transform duration-300 shadow-2xl ${
          isZoomed ? "scale-100" : "scale-75"
        }`}
      />
    </div>
  </div>
)}
</div>
          <div className="flex flex-col items-end space-y-2">
            <div className="bg-gray-100 rounded-lg p-4 shadow w-full md:w-1/2">
              <div className="flex justify-between">
                <p className="font-medium">Subtotal</p>
                <p className="text-gray-700">$ {getTotal().toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg p-4 shadow w-full md:w-1/2">
              <div className="flex justify-between">
                <p className="font-semibold">Total</p>
                <p className="text-gray-900 text-md">
                  $ {getTotal().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-4 text-sm  leading-8 dark:text-white">
            <p>Your <span className="font-semibold">{jobTitle}</span>. Please let me know if you have any questions.</p>
            <p>This quote is valid for the next 30 days, after which values may be subject to change.</p>
          </div>
        </div>

        <div className="flex flex-col items-stretch space-y-4">
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-sm text-gray-500">Quote Total</p>
            <p className="text-2xl font-bold text-gray-800">
              $ {getTotal().toLocaleString()}
            </p>
          </div>

          <button 
          className="bg-green-600 text-white font-semibold py-2 px-4 rounded-2xl shadow hover:bg-green-700"
          onClick={handleApproved}
          >
            Approve
          </button>
          <button
  className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-2xl shadow 
             hover:bg-blue-600 active:scale-95 transition-all duration-200" 
  onClick={() => setIsRequestModalOpen(true)}
>
  Request Changes
</button>
        </div>

        {isRequestModalOpen && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 
               animate-fadeIn" 
  >
    <div
      className="bg-white rounded-2xl shadow-lg p-6 w-11/12 md:w-1/3 transform 
                 transition-all duration-300 ease-out scale-95 opacity-0 animate-scaleIn 
                 relative" 
    >

      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 
                   transition-colors duration-200" 
        onClick={() => setIsRequestModalOpen(false)}
      >
        ✕
      </button>

      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Request Changes
      </h2>

      <textarea
        className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-sm 
                   focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
                   transition-all duration-200" 
        rows={5}
        placeholder="Enter your change request..."
        value={requestMessage}
        onChange={(e) => setRequestMessage(e.target.value)}
      />

  
      <div className="flex justify-end space-x-3">
        <button
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 
                     active:scale-95 transition-all duration-200 text-sm" 
          onClick={() => setIsRequestModalOpen(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 active:scale-95 
                     transition-all duration-200 text-sm" 
          onClick={handleRequestChanges}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}

      </div>
      )}
    </div>
     
    <style>{`
      @keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}

.animate-scaleIn {
  animation: scaleIn 0.25s ease-out forwards;
}
      `}</style>
    </>
  );
};

export default Preview;
