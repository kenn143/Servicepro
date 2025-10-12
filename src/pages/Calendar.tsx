import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
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
  // const [eventDate, setEventDate] = useState("");
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [imageBase64, setImageBase64] = useState("");

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  

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
          .filter((record: any) => record.fields.DateScheduled && record.fields.JobTitle)
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


  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventDate(selectInfo.start); 
    openModal();
  };

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
    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
    alert("sdkfjjf")
    if (!eventTitle || !eventDate) {
      toast.warning("Please enter event name and date.");
      return;
    }

    const payload = {
      jobTitle:eventTitle,
      houseAddress,
      clientName,
      typeOfLights,
      lightsAmount,
      dateSchedule: eventDate ? eventDate.toISOString() : "",
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

      console.log("submitted", payload);

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
          start: eventDate ? eventDate.toISOString() : "",
          extendedProps: {
            houseAddress,
            clientName,
            typeOfLights,
            lightsAmount,
          },
        };
        setEvents((prev) => [...prev, newEvent]);
      }

      closeModal();
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

  return (
    <>
      <PageMeta title="Lighting Calendar" description="" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "timeGridDay,timeGridWeek,dayGridMonth",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Add Event +",
              click: openModal,
            },
          }}
        />

<Modal
  isOpen={isOpen}
  onClose={closeModal}
  className="max-w-[500px] p-4 lg:p-6" // smaller width + less padding
>
  <div className="flex flex-col px-1 overflow-y-auto custom-scrollbar">
    <h5 className="mb-3 font-semibold text-gray-800 text-lg">
      {selectedEvent ? "Edit Event" : "Add New Job"}
    </h5>

    <div className="grid grid-cols-1 gap-4 mt-4">
      <div>
        <label className="block text-xs font-medium mb-1">Job Title</label>
        <input
          type="text"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="Enter job title"
          className="w-full rounded-lg border px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Schedule</label>
        <DatePicker
          selected={eventDate}
          onChange={(date) => setEventDate(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMM d, yyyy h:mm aa"
          placeholderText="Select date & time"
          className="w-full rounded-lg border px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">House Address</label>
        <input
          type="text"
          value={houseAddress}
          onChange={(e) => setHouseAddress(e.target.value)}
          placeholder="Enter address"
          className="w-full rounded-lg border px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Client Name</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Enter client name"
          className="w-full rounded-lg border px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Type of Lights</label>
        <input
          type="text"
          value={typeOfLights}
          onChange={(e) => setTypeOfLights(e.target.value)}
          className="w-full rounded-lg border px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">
          Amount of Lights Needed
        </label>
        <input
          type="number"
          min={1}
          value={lightsAmount}
          onChange={(e) => setLightsAmount(e.target.value)}
          className="w-full rounded-lg border px-3 py-1.5 text-sm"
        />
      </div>

      <div className="">
        <label className="block text-xs font-medium mb-1">
          Image of Lights Design
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                setImageBase64(reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          }}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-all duration-150 ease-in-out w-19"
        />
      </div>
    </div>

    <div className="flex items-center gap-2 mt-6 justify-end">
      <button
        onClick={closeModal}
        className="rounded-lg border px-3 py-1.5 text-xs text-gray-600"
      >
        Close
      </button>
      <button
        onClick={handleAddOrUpdateEvent}
        className="rounded-lg bg-sky-500 hover:bg-sky-600 px-3 py-1.5 text-xs text-white"
      >
        Create
      </button>
    </div>
  </div>
</Modal>

      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => (
  <div className="flex items-center space-x-1">
    <div className="fc-daygrid-event-dot"></div>
    {/* <b>{eventInfo.timeText}</b> */}
    <span className="bg-blue-300 rounded w-25 text-center">{eventInfo.event.title}</span>
  </div>
);

export default Calendar;
