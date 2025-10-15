import { useEffect, useState } from "react";
import { BoxIconLine, GroupIcon } from "../../icons";

interface AirtableCustomerRecord {
  id: string;
  createdTime: string;
  fields: {
    CustomerId?: number;
    CustomerName?: string;
    Address?: string;
    Status?: string;
    PhoneNumber?: string;
    EmailAddress?: string;
    DateCreated?: string;
  };
}

interface AirtableQuoteRecord {
  id: string;
  createdTime: string;
  fields: {
    "Quote ID"?: number;
    ClientID?: number;
    "Job Title"?: string;
    "Total Amount"?: number;
    "Quote Number"?: string;
    Status?: string;
  };
}

interface AirtableResponse<T> {
  records: T[];
}

export default function EcommerceMetrics() {
  const [activeCustomers, setActiveCustomers] = useState<number>(0);
  const [totalQuotes, setTotalQuotes] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch Active Customers
        const customerResponse = await fetch(
          "https://api.airtable.com/v0/appxmoiNZa85I7nye/tbl5zFFDDF4N3hYv0",
          {
            headers: {
              Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`,
            },
          }
        );
        const customerData: AirtableResponse<AirtableCustomerRecord> =
          await customerResponse.json();

        const activeCount = customerData.records.filter(
          (rec) => rec.fields.Status === "Active"
        ).length;
        setActiveCustomers(activeCount);

        // Fetch Total Quotes Sent
        const quoteResponse = await fetch(
          "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblbF4N9Ixi3mRFKW",
          {
            headers: {
              Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`,
            },
          }
        );
        const quoteData: AirtableResponse<AirtableQuoteRecord> =
          await quoteResponse.json();

        setTotalQuotes(quoteData.records.length);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Loader component for each card
  const CardLoader = () => (
    <div className="flex flex-col items-center justify-center h-28">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Active Customers Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Active Customers
          </span>
          {loading ? (
            <CardLoader />
          ) : (
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {activeCustomers.toLocaleString()}
            </h4>
          )}
        </div>
      </div>

      {/* Total Quote Sent Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Quotes Sent
          </span>
          {loading ? (
            <CardLoader />
          ) : (
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalQuotes.toLocaleString()}
            </h4>
          )}
        </div>
      </div>
    </div>
  );
}
