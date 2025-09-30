import { useEffect, useState } from "react";
import PageMeta from "../components/common/PageMeta";

interface RecordFields {
  TrackId: number;
  Image?: { url: string; thumbnails?: { small?: { url: string } } }[];
  Type?: string;
  Lat?: number;
  Long?: number;
  DateCreated?: string;
  UserId?: string[];
  UserName?: string[];
}

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: RecordFields;
}

const Captures: React.FC = () => {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const [usernameSearch, setUsernameSearch] = useState<string>("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch(
          "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblE4mC8DNhpQ1j3u",
          {
            headers: {
              Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`, // ⚡ move API key to .env
            },
          }
        );
        const data = await res.json();
        setRecords(data.records || []);
      } catch (error) {
        console.error("Error fetching Airtable records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);


  const filteredRecords = records.filter((rec) =>
    usernameSearch.trim() === ""
      ? true
      : rec.fields.UserName?.some((name) =>
          name.toLowerCase().includes(usernameSearch.toLowerCase())
        )
  );

  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const goToPage = (page: number) => setCurrentPage(page);
  const goToPrevious = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNext = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handleRecordsPerPageChange = (newRecordsPerPage: number) => {
    setRecordsPerPage(newRecordsPerPage);
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta title="ServicePros" description="" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 dark:text-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by username..."
              value={usernameSearch}
              onChange={(e) => {
                setUsernameSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 dark:border-gray-700 rounded px-4 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 "
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>Show:</span>
            <select
              value={recordsPerPage}
              onChange={(e) =>
                handleRecordsPerPageChange(Number(e.target.value))
              }
              className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>
        </div>

        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    Loading captures...
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
                <thead className="bg-gray-100 dark:bg-gray-800 text-sm sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      User Name
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      Image
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      Type
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      Lat
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      Long
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      Date Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((rec) => (
                      <tr
                        key={rec.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900 text-sm border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="px-4 py-3">
                          {rec.fields.UserName?.join(", ") || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {rec.fields.Image?.[0]?.thumbnails?.small?.url ? (
                            <img
                              src={rec.fields.Image[0].thumbnails.small.url}
                              alt="thumb"
                              className="w-12 h-12 object-cover rounded-lg mx-auto cursor-pointer transform transition-all duration-200 hover:scale-110 hover:shadow-lg hover:brightness-110"
                              onClick={() =>
                                setSelectedImage(
                                  rec.fields.Image?.[0]?.url || ""
                                )
                              }
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">{rec.fields.Type || "-"}</td>
                        <td className="px-4 py-4 text-center">{rec.fields.Lat ?? "-"}</td>
                        <td className="px-4 py-3 text-center">{rec.fields.Long ?? "-"}</td>
                        <td className="px-4 py-3">
                          {rec.fields.DateCreated
                            ? new Date(
                                rec.fields.DateCreated
                              ).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 bg-white dark:bg-white/[0.03]">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {loading
                  ? "Loading..."
                  : totalRecords === 0
                  ? "No entries found"
                  : `Showing ${startIndex + 1} to ${Math.min(
                      endIndex,
                      totalRecords
                    )} of ${totalRecords} entries`}
              </div>

              <div className="flex items-center">
                <nav className="flex items-center space-x-1">
                  {totalPages > 1 && (
                    <>
                      {currentPage > 3 && totalPages > 7 && (
                        <>
                          <button
                            onClick={() => goToPage(1)}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                          >
                            1
                          </button>
                          <span className="px-2 py-2 text-gray-500 dark:text-gray-400">
                            ...
                          </span>
                        </>
                      )}

                      <button
                        onClick={goToPrevious}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        ‹
                      </button>

                      {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 7) {
                          pageNum = i + 1;
                        } else if (currentPage <= 4) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 6 + i;
                        } else {
                          pageNum = currentPage - 3 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium border ${
                              currentPage === pageNum
                                ? "text-blue-600 bg-blue-50 border-blue-300 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-600"
                                : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={goToNext}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        ›
                      </button>
                      {currentPage < totalPages - 2 && totalPages > 7 && (
                        <>
                          <span className="px-2 py-2 text-gray-500 dark:text-gray-400">
                            ...
                          </span>
                          <button
                            onClick={() => goToPage(totalPages)}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {totalPages <= 1 && !loading && (
                    <div className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
                      Page 1 of 1
                    </div>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 rounded"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative animate-[slideIn_0.3s_ease-out] rounded-full"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
            >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
            </button>

            <img
              src={selectedImage}
              alt="full"
              className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl transition-all duration-300 "
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Captures;
