import { useState, useRef } from "react";
import PageMeta from "../components/common/PageMeta";
import { CiCamera, CiCircleCheck } from "react-icons/ci";
import { FaRegCircle } from "react-icons/fa";


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



const FileTracker: React.FC = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      (err) => setError(err.message)
    );
  };

  const [selected, setSelected] = useState("Flyers");
  const options = [
    { value: "Flyers", label: "Flyers" },
    { value: "Signs", label: "Signs" },
  ];

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [captureTime, setCaptureTime] = useState<Date | null>(null);

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    setCaptureTime(new Date());
    getLocation();

    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        // Cloudinary upload
        const cloudinaryUrl = "https://api.cloudinary.com/v1_1/doj0vye62/image/upload";
        const cloudinaryUploadPreset = "Qoute_FileName";

        const cloudData = new FormData();
        cloudData.append("file", file);
        cloudData.append("upload_preset", cloudinaryUploadPreset);

        const cloudinaryResponse = await fetch(cloudinaryUrl, {
          method: "POST",
          body: cloudData,
        });

        const cloudinaryResult = await cloudinaryResponse.json();
        const uploadedImageUrl = cloudinaryResult.secure_url;
        console.log("Image uploaded to Cloudinary:", uploadedImageUrl);


        const records = [
          {
            image: uploadedImageUrl,
            type: selected,
            latitude,
            longitude,
            recordId: getToken()?.ID,
          },
        ];

        const webhookUrl = "https://hook.us2.make.com/q8ovvnztkqwrymqbppbfoyb4xseq54hk";
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(records),
        });

        if (!webhookResponse.ok) throw new Error("Webhook failed");
        console.log("Data sent to webhook successfully");

        const userName = getToken()?.UserName || "";
        const selectedType = selected || "";

        const formula = `AND({UserName}='${userName}', {Type}='${selectedType}', IS_SAME(CREATED_TIME(), TODAY(), 'day'))`;

        const totalCountResponse = await fetch(
          `https://api.airtable.com/v0/appUbFQNnqLyAE91b/tbldM9CuFapFApSCe?filterByFormula=${encodeURIComponent(
            formula
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer patOqbvQBRYKN0N9t.ad5d76ed48b85d7a6ba0d090b6e3cfbe27df9e12d40d7cbcc0995c9b3d51a86b`,
            },
          }
        );

        if (!totalCountResponse.ok) {
          throw new Error(`Airtable fetch failed: ${totalCountResponse.status} ${totalCountResponse.statusText}`);
        }

        const airtableData = await totalCountResponse.json();
        setTotalCount(airtableData.records.length);
        console.log("Total records today:", airtableData);
      } catch (error) {
        console.error("Error:", error);
      }
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };



  return (
    <>
      <PageMeta
        title="ServicePros"
        description=""
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendars">
          <div className="min-h-screen flex flex-col items-center pt-12 ">
            <div className="absolute top-4 right-4">

            </div>
            <h1 className="text-3xl font-semibold text-blue-950 mb-8 dark:text-white/90">
              Welcome to Flyer Tracker App
            </h1>

            <div className="flex gap-6 items-center mb-6">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-150 text-sm ${
                    selected === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-transparent text-blue-900 border border-blue-600"
                  }`}
                >
                  {selected === opt.value ? <CiCircleCheck size={20} /> : <FaRegCircle size={20} />}
                  {opt.label}
                </button>
              ))}
            </div>

            <div
              className="w-45 h-38 border mt-5 mb-10 border-blue-950 rounded-lg flex flex-col items-center justify-center  cursor-pointer hover:shadow-md transition dark:border-white"
              onClick={handleBoxClick}
            >
              <CiCamera className="text-blue-400 text-6xl mb-2" />
              <p className="text-blue-950 font-semibold text-md dark:text-white/90">Click here to capture!</p>
            </div>

            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {imageUrl && captureTime && (
              <div className="mt-10 w-full bg-indigo-100 p-8 rounded-xl shadow-md flex flex-col items-center">
                <p className="text-md text-blue-900 font-medium mb-4 text-center">
                  Congratulations, you've captured{" "}
                  <span className="font-bold text-blue-700">{totalCount}</span> {selected.toLowerCase()} today.
                  <br />
                  You can do it, capture more on flyer-tracker.
                </p>

                <img src={imageUrl} alt="Captured" className="rounded-lg mb-6 max-w-md" />

                <p className="text-md text-blue-900 mb-1">
                  Last Capture: <span className="text-blue-700 font-medium">{formatDateTime(captureTime)}</span>
                </p>
                <p className="text-md text-blue-900 mb-4">
                  Location: <span className="text-blue-700 cursor-pointer">{latitude}, {longitude}</span>
                </p>

                <button className="bg-white text-blue-800 font-semibold py-2 px-6 rounded-md shadow hover:bg-gray-100">
                  {selected}
                </button>
              </div>
            )}

            {error && <p className="text-red-600 mb-4">{error}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default FileTracker;
