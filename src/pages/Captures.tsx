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

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch(
          "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblE4mC8DNhpQ1j3u",
          {
            headers: {
              Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`, 
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

  return (
    <>
      <PageMeta title="ServicePros" description="" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
        <h1 className="text-lg font-semibold mb-4">Captures</h1>

        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-100 dark:bg-gray-800 text-sm">
                <tr>
                  {/* <th className="px-4 py-2 border">TrackId</th> */}
                  <th className="px-4 py-2 border">Image</th>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Lat</th> 
                  <th className="px-4 py-2 border">Long</th>
                  <th className="px-4 py-2 border">Date Created</th>
                  <th className="px-4 py-2 border">User Name</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 text-sm"
                  >
                    {/* <td className="px-4 py-2 border text-center">
                      {rec.fields.TrackId}
                    </td> */}
                    <td className="px-4 py-2 border text-center">
                      {rec.fields.Image?.[0]?.thumbnails?.small?.url ? (
                        <img
                          src={rec.fields.Image[0].thumbnails.small.url}
                          alt="thumb"
                          className="w-12 h-12 object-cover rounded-lg mx-auto cursor-pointer"
                          onClick={() =>
                            setSelectedImage(rec.fields.Image?.[0]?.url || "")
                          }
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2 border">{rec.fields.Type || "-"}</td>
                    <td className="px-4 py-2 border">{rec.fields.Lat ?? "-"}</td>
                    <td className="px-4 py-2 border">{rec.fields.Long ?? "-"}</td>
                    <td className="px-4 py-2 border">
                      {rec.fields.DateCreated
                        ? new Date(rec.fields.DateCreated).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border">
                      {rec.fields.UserName?.join(", ") || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for full image */}
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative">
            <img
              src={selectedImage}
              alt="full"
              className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-lg"
            />
            <button
              className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-semibold shadow"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Captures;
