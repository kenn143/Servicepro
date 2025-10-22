import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg } from "@fullcalendar/core";
import PageMeta from "../components/common/PageMeta";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar?: string;
    houseAddress?: string;
    clientName?: string;
    typeOfLights?: string;
    lightsAmount?: string;
    salesPerson?: string;
    installerStaff?: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [houseAddress, setHouseAddress] = useState("");
  const [clientName, setClientName] = useState("");
  const [typeOfLights, setTypeOfLights] = useState("");
  const [lightsAmount, setLightsAmount] = useState("");
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [imageBase64, setImageBase64] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);

  const calendarRef = useRef<FullCalendar>(null);

const [finishModalOpen, setFinishModalOpen] = useState(false);
const [lightsUsed, setLightsUsed] = useState("");
const [cordsUsed, setCordsUsed] = useState("");
const [timersUsed, setTimersUsed] = useState("");
const [completeImageBase64, setCompleteImageBase64] = useState("");
const [jobNotes, setJobNotes] = useState("");
const [clientComments, setClientComments] = useState("");
const [query, setQuery] = useState("");
const [filtered, setFiltered] = useState<any[]>([]);
const [loading, setLoading] = useState(false);
const [customerId,setCustomerId] = useState("");

const AIRTABLE_ENDPOINT =
  "https://api.airtable.com/v0/appxmoiNZa85I7nye/tbl5zFFDDF4N3hYv0"; 
const AIRTABLE_TOKEN =
  "patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609";

const handleCustomerSearch = async (value: string) => {
  setQuery(value);
  setFiltered([]);
  if (value.trim() === "") {
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(
      `${AIRTABLE_ENDPOINT}?filterByFormula=SEARCH(LOWER("${value}"), LOWER({CustomerName}))`,
      { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } }
    );
    if (!response.ok) throw new Error("Failed to fetch customers");

    const data = await response.json();
    const results = data.records.map((rec: any) => ({
      CustomerId: rec.id,
      CustomerName: rec.fields.CustomerName || "",
      Address: rec.fields.Address || "",
      Status: rec.fields.Status || "Unknown",
      PhoneNumber: rec.fields.PhoneNumber || "",
      EmailAddress: rec.fields.EmailAddress || "",
      DateCreated: rec.createdTime,
    }));
    setFiltered(results);
  } catch (err) {
    console.error(err);
    setFiltered([]);
  } finally {
    setLoading(false);
  }
};

const handleSelectCustomer = (cust: any) => {
  setClientName(cust.CustomerName);
setCustomerId(cust.CustomerId);
  setQuery("");
  setFiltered([]);
  setLoading(false);
};


  useEffect(() => {
    const fetchJobsFromAirtable = async () => {
      try {
        const res = await fetch(
          "https://api.airtable.com/v0/appxmoiNZa85I7nye/tbltyOXOlotQfkygb",
          {
            headers: {
              Authorization:
                "Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609",
            },
          }
        );

        if (!res.ok) {
          toast.error("Failed to fetch Airtable data");
          return;
        }

        const data = await res.json();

        const formattedEvents: CalendarEvent[] = data.records
          .filter(
            (record: any) =>
              record.fields.DateScheduled && record.fields.JobTitle
          )
          .map((record: any) => ({
            id: record.id,
            title: record.fields.JobTitle,
            start: record.fields.DateScheduled,
            extendedProps: {
              houseAddress: record.fields.HouseAddress,
              clientName: record.fields.CustomerName?.[0],
              typeOfLights: record.fields.TypeOfLights,
              lightsAmount: record.fields.AmountOfLights,
              salesPerson: record.fields.SalesPerson,
              installerStaff: record.fields.InstallerStaff,
            },
          }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching Airtable data:", err);
        toast.error("Network error while loading events.");
      }
    };

    fetchJobsFromAirtable();
  }, []);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const props = event.extendedProps as CalendarEvent["extendedProps"];

    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventDate(event.start ? new Date(event.start) : null);
    setHouseAddress(props.houseAddress || "");
    setClientName(props.clientName || "");
    setTypeOfLights(props.typeOfLights || "");
    setLightsAmount(props.lightsAmount || "");
    setImageBase64("");
    setPopupOpen(true);
  };

  const handleAddOrUpdateEvent = async () => {
    if (!eventTitle || !eventDate) {
      toast.warning("Please enter job title and date.");
      return;
    }

    const payload = {
      jobTitle: eventTitle,
      houseAddress,
      clientName,
      typeOfLights,
      lightsAmount,
      dateSchedule: eventDate ? eventDate.toISOString() : "",
      customerId: customerId,
      imageBase64,
    };
    try {
      const res = await fetch(
        "https://hook.us2.make.com/n7qy68jvwjjow10s2034jrdx9ld1yu41",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) toast.success("Submitted Successfully");
      else toast.error("Webhook request failed.");

      if (selectedEvent) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === selectedEvent.id
              ? { ...e, title: eventTitle, start: eventDate }
              : e
          )
        );
      } else {
        const newEvent: CalendarEvent = {
          id: Date.now().toString(),
          title: eventTitle,
          start: eventDate.toISOString(),
          extendedProps: {
            houseAddress,
            clientName,
            typeOfLights,
            lightsAmount,
          },
        };
        setEvents((prev) => [...prev, newEvent]);
      }

      setPopupOpen(false);
      resetModalFields();
    } catch (err) {
      console.error(err);
      toast.error("Network error while sending webhook.");
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setHouseAddress("");
    setClientName("");
    setTypeOfLights("");
    setLightsAmount("");
    setImageBase64("");
    setSelectedEvent(null);
  };

const handleSubmitCompletion = async () => {
  if (!selectedEvent) return;

  const completionPayload = {
    jobId: selectedEvent.id,
    jobTitle: selectedEvent.title,
    lightsUsed,
    cordsUsed,
    timersUsed,
    completeImageBase64,
    jobNotes,
    clientComments,
    action:"JobFinish"
  };

  try {
    const res = await fetch(
      "https://hook.us2.make.com/n7qy68jvwjjow10s2034jrdx9ld1yu41", 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
        },
        body: JSON.stringify(completionPayload),
      }
    );

    if (res.ok) toast.success("Completion submitted successfully!");
    else toast.error("Failed to submit completion data.");

    setFinishModalOpen(false);
    setPopupOpen(false);
    setLightsUsed("");
    setCordsUsed("");
    setTimersUsed("");
    setJobNotes("");
    setClientComments("");
    setCompleteImageBase64("");
  } catch (err) {
    console.error(err);
    toast.error("Network error while submitting completion data.");
  }
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


  return (
    <>
      <PageMeta title="Lighting Calendar" description="" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] relative">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          height="80%"
          contentHeight="auto"
          expandRows={true}
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "timeGridDay,timeGridWeek,dayGridMonth",
          }}
          events={events}
          selectable={false} 
          select={undefined} 
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Add Job +",
              click: () => {
                resetModalFields();
                setEventDate(new Date());
                setSelectedEvent(null);
                setPopupOpen(true);
              },
            },
              
          }}
        />    

        {popupOpen && (
          <div
            className="fixed bg-white border shadow-xl rounded-xl p-5 w-[420px] z-50"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <h5 className="text-base font-semibold mb-4">
              {selectedEvent ? "Edit Job" : "Add New Job"}
            </h5>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="Job Title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Client Name
                </label>
                <div>

                          {!clientName ? (
                            <>
                              <input
                                type="text"
                                placeholder="Search customer..."
                                value={query}
                                onChange={(e) => handleCustomerSearch(e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm"
                              />

                        {loading && (
                          <div className="flex justify-center items-center mt-2">
                            <svg
                              className="animate-spin h-6 w-6 text-blue-500"
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
                          </div>
                        )}



                      {!loading && query.trim() !== "" && (
                        <ul className="mt-1 max-h-32 overflow-y-auto border rounded bg-white shadow text-sm">
                          {filtered.length > 0 ? (
                            filtered.map((cust) => (
                              <li
                                key={cust.CustomerId}
                                onClick={() => handleSelectCustomer(cust)}
                                className="px-2 py-1 cursor-pointer hover:bg-gray-100"
                              >
                                {cust.CustomerName}
                              </li>
                            ))
                          ) : (
                            <li className="px-2 py-1 text-gray-500 text-xs">
                              No results found
                            </li>
                          )}
                        </ul>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-between border rounded px-2 py-1 text-sm bg-gray-50">
                      <span>{clientName}</span>
                      <button
                        onClick={() => setClientName("")}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  House Address
                </label>
                <input
                  type="text"
                  placeholder="House Address"
                  value={houseAddress}
                  onChange={(e) => setHouseAddress(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Type of Lights
                </label>
                <input
                  type="text"
                  placeholder="Type of Lights"
                  value={typeOfLights}
                  onChange={(e) => setTypeOfLights(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Amount of Lights
                </label>
                <input
                  type="text"
                  placeholder="Amount of Lights"
                  value={lightsAmount}
                  onChange={(e) => setLightsAmount(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Schedule Date
                </label>
                <br />
                <DatePicker
                  selected={eventDate}
                  onChange={(date) => setEventDate(date)}
                  showTimeSelect
                  dateFormat="MMM d, yyyy h:mm aa"
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Lights Design Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () =>
                        setImageBase64(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
            {selectedEvent && getToken()?.UserType === "LightsInstaller" && (
                <button
                  onClick={() => setFinishModalOpen(true)} 
                  disabled={
                    !eventDate ||
                    new Date(eventDate).toDateString() !== new Date().toDateString()
                  }
                  className={`text-xs px-3 py-1 rounded text-white ${
                    !eventDate ||
                    new Date(eventDate).toDateString() !== new Date().toDateString()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Job Finish
                </button>
              )}
 
              <button
                onClick={() => setPopupOpen(false)}
                className="text-xs px-3 py-1 border rounded text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                className="text-xs px-3 py-1 bg-sky-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        )}

  {finishModalOpen && (
    <div
      className="fixed bg-white border shadow-2xl rounded-xl p-5 w-[450px] z-50"
      style={{
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
  >
    <h5 className="text-base font-semibold mb-4 text-gray-800">
      After House Completion
    </h5>

    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-600">
          How many lights were used
        </label>
        <input
          type="text"
          placeholder="Number of lights"
          value={lightsUsed}
          onChange={(e) => setLightsUsed(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">
          How many cords were used
        </label>
        <input
          type="text"
          placeholder="Number of cords"
          value={cordsUsed}
          onChange={(e) => setCordsUsed(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">
          How many timers were used
        </label>
        <input
          type="text"
          placeholder="Number of timers"
          value={timersUsed}
          onChange={(e) => setTimersUsed(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">
          Picture of house with lights complete
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () =>
                setCompleteImageBase64(reader.result as string);
              reader.readAsDataURL(file);
            }
          }}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">
          Notes (difficulties with job)
        </label>
        <textarea
          placeholder="Describe any difficulties..."
          value={jobNotes}
          onChange={(e) => setJobNotes(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
          rows={3}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">
          Comments from client
        </label>
        <textarea
          placeholder="Client feedback..."
          value={clientComments}
          onChange={(e) => setClientComments(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
          rows={2}
        />
      </div>
    </div>

    <div className="flex justify-end gap-2 mt-5">
      <button
        onClick={() => setFinishModalOpen(false)}
        className="text-xs px-3 py-1 border rounded text-gray-500"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmitCompletion} 
        className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Submit
      </button>
    </div>
  </div>
)}

      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => (
  <div className="flex items-center space-x-1">
    <span className="bg-blue-300 rounded w-25 text-center px-1">
      {eventInfo.event.title}
    </span>
  </div>
);


export default Calendar;