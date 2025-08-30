import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Interfaces for Airtable data
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
    "Item Name"?: string;
    Description?: string;
    Quantity?: number;
    "Unit Price"?: number;
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
const [, setLoading] = useState<boolean>(false);

  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate(`/quotation-list`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const url = `https://api.airtable.com/v0/app4pNHoxT8aj9vzJ/tbluuR1Nl6tbnLhS2/${id}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization:
              "Bearer pat3UfBiORCRUDmnz.e300c4a692d7eebbb77d85848146bc048e39b58cde696374fc7ac9467a61468e",
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
      const url = `https://api.airtable.com/v0/app4pNHoxT8aj9vzJ/tblYVFWQZUwxenmiw?filterByFormula=${encodeURIComponent(formula)}`;
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer patAFsT3g1wFUFyk8.1c95d3e5a6b3062dc4c13f144f5dcd70aa89b1ecca4ff68880721b10640b08bf",
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
     const formula = `{ClientID} = ${id}`; 
    const url = `https://api.airtable.com/v0/app4pNHoxT8aj9vzJ/tblLRXGbGHNnaf8bF?filterByFormula=${encodeURIComponent(formula)}`;
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer pat2hVGQIspOMAhMC.0f845073a21d5cfe012c97f92393af8cdda9d0e33f0f890e2923be81b4f81cfd", 
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();

      const name = data.records[0]?.fields?.Name || "";
      const email = data.records[0]?.fields?.["Email Address"] || "";
      const phone = data.records[0]?.fields?.["Phone Number"] || "";
      const addr = data.records[0]?.fields?.["Address"] || "";

      setClientName(name);
      setEmailAddress(email);
      setPhoneNumber(phone);
      setAddress(addr);

      setLoading(false);
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
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
      const price = item.fields["Unit Price"] || 0;
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
      approved: 1,
    };

    const response = await fetch("https://hook.us2.make.com/415jpaj3alwy9nceagf5rg7oprt8s6v6", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotation),
    });

    if (response.ok) {
      navigate(`/Approved`);
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
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendars">
                <div className="min-h-screen  font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2  rounded-2xl shadow p-2 flex flex-col space-y-6">
         <div className="flex justify-start">
         <button className="flex items-center text-sm text-gray-700 hover:text-black dark:text-white" onClick={handleRedirect}>
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
            </button>
        </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                        ${status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                    >
                    {status === null ? (
                        "Loading..."
                    ) : status === "Pending" ? (
                        <>
                        ⭕ Awaiting Response
                        </>
                    ) : (
                        <>
                        ✔️ Approved
                        </>
                    )}
                </button>


              <div className="flex justify-end space-x-2 items-baseline">
                <p className="text-sm dark:text-white">Sent on</p>
                <p className="font-semibold text-lg dark:text-white">{datecreated}</p>
              </div>
            </div>
          </div>


          <div className="w-full overflow-x-hidden">
  <table className="w-full table-fixed border-collapse border-b-4 text-md">
    <thead>
      <tr className=" dark:text-white">
        <th className="border px-1 py-2 text-center w-[20%] text-sm">Selection</th>
        <th className="border px-1 py-2 text-center w-[30%] text-sm">Lighting Style</th>
        <th className="border px-1 py-2 text-center w-[25%] text-sm">Attachment</th>
        <th className="border px-1 py-2 text-center w-[25%] text-sm">Unit Price</th>
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
              <div>{item.fields["Item Name"]}</div>
              {item.fields["Description"] && (
                <div className="text-xs dark:text-white">( {item.fields["Description"]} )</div>
              )}
            </td>
      <td className="border px-1 py-2 text-center">
  {(() => {
    const attachment = item.fields.Attachments?.[0]; 
    if (!attachment) {
      return <span className="text-sm dark:text-white">No Attachment</span>;
    }
            return (
            <img
                src={attachment.thumbnails?.small?.url || attachment.url}
                alt="Attachment"
                className="w-10 h-10 object-cover rounded shadow mx-auto cursor-pointer"
                onClick={() => openImageModal(attachment.url)}
            />
            );
        })()}
        </td>

          <td className="border px-1 py-2 text-center text-sm dark:text-white">
            ${item.fields["Unit Price"]?.toLocaleString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {modalImage && (
  <div
    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    onClick={closeImageModal}
  >
    <div
      className=" rounded-lg p-2 max-w-[90%] max-h-[90%]"
      onClick={(e) => e.stopPropagation()} 
    >
      <img
        src={modalImage}
        alt="Full size"
        className={`max-w-full max-h-[80vh] object-contain rounded transition-transform duration-300 ${
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
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-2xl shadow hover:bg-blue-700"
          onClick={handleApproved}
          >
            Approve
          </button>
          <button className="bg-red-500 text-white font-semibold py-2 px-4 rounded-2xl shadow hover:bg-red-600">
            Request Changes
          </button>
        </div>
      </div>
    </div>
        </div>
      </div>
    </>
  );
};

export default Preview;
