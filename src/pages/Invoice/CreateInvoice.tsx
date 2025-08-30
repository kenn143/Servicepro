import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { ReceiptText } from "lucide-react"; 

const customers = [
  "Rowel Tabiolo",
  "Michael Jackson",
  "Elon Musk",
  "Steve Jobs",
  "Mark Tuto",

];

export default function CreateInvoice() {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string) => {
    setQuery(value);
    if (value.trim() === "") {
      setFiltered([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const results = customers.filter((c) =>
        c.toLowerCase().includes(value.toLowerCase())
      );
      setFiltered(results);
      setLoading(false);
    }, 600); 
  };

  const handleSelect = (name: string) => {
    setQuery(name);
    setFiltered([]);
    setLoading(false);
  };

  return (
    <>
      <PageMeta title="ServicePros" description="" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] min-h-[500px]">
        <div className="custom-calendars">
          <div className="max-w-md mx-auto mt-10">
            <div className="rounded-2xl border bg-white shadow p-6 min-h-[150px] ">
              <ReceiptText className="mx-auto mb-2 h-10 w-10 text-gray-600" />

              <h2 className="mb-1 text-lg font-semibold text-center">Create New Invoice</h2>
              <p className="mb-4 text-sm text-gray-600 text-center">
                Before we proceed, please select a customer
              </p>

              <input
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search customer..."
                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none"
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
                    filtered.map((name, idx) => (
                      <li
                        key={idx}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                        onClick={() => handleSelect(name)}
                      >
                        {name}
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
          </div>
        </div>
      </div>
    </>
  );
}
