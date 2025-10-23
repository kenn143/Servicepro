import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PageMeta from "../../components/common/PageMeta";


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface RecordFields {
  TrackId: number;
  Image?: { url: string }[];
  Type?: string;
  Lat?: number;
  Long?: number;
  DateCreated?: string;
  UserName?: string[];
}

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: RecordFields;
}

const defaultCenter: LatLngExpression = [12.8797, 121.774]; 

const CapturesMap: React.FC = () => {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch(
          "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblE4mC8DNhpQ1j3u?sort[0][field]=DateCreated&sort[0][direction]=desc",
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

  const locationRecords = records.filter(
    (rec) => rec.fields.Lat && rec.fields.Long
  );
  const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  const greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const blueIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const violetIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const greyIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  
  return (
    <>
      <PageMeta title="Captured Locations" description="Map View of Captures" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Captured Locations</h2>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-blue-500 rounded-sm"></span>
            <span className="text-sm">1 week</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-violet-500 rounded-sm"></span>
            <span className="text-sm">2 weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-gray-400 rounded-sm"></span>
            <span className="text-sm">3 weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-red-500 rounded-sm"></span>
            <span className="text-sm">Month</span>
          </div>
        </div>
      </div>
        {loading ? (
          <div className="flex justify-center items-center h-[600px]">
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                Loading map data...
              </span>
            </div>
          </div>
        ) : (
          <MapContainer
            center={
              locationRecords.length > 0
                ? ([locationRecords[0].fields.Lat!, locationRecords[0].fields.Long!] as LatLngExpression)
                : defaultCenter
            }
            zoom={6}
            style={{ height: "600px", width: "100%", borderRadius: "12px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />

          {locationRecords.map((rec) => {
            if (!rec.fields.Lat || !rec.fields.Long) return null;

            let icon = greenIcon; 

            if (rec.fields.DateCreated) {
              const createdDate = new Date(rec.fields.DateCreated);
              const now = new Date();
              const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24); 

              icon = diffInDays < 7 ? blueIcon : diffInDays < 14 ? violetIcon: diffInDays < 21 ? greyIcon: redIcon;
            }

            return (
              <Marker
                key={rec.id}
                position={[rec.fields.Lat, rec.fields.Long] as LatLngExpression}
                icon={icon}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-semibold">
                      {rec.fields.UserName?.join(", ") || "Unknown User"}
                    </h3>
                    <p>Type: {rec.fields.Type || "-"}</p>
                    <p>
                      Date:{" "}
                      {rec.fields.DateCreated
                        ? new Date(rec.fields.DateCreated).toLocaleString()
                        : "-"}
                    </p>
                    {rec.fields.Image?.[0]?.url && (
                      <img
                        src={rec.fields.Image[0].url}
                        alt="capture"
                        className="mt-2 w-40 h-28 object-cover rounded"
                      />
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          </MapContainer>
        )}
      </div>
    </>
  );
};

export default CapturesMap;
