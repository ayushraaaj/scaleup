"use client";
import { api } from "@/services/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Slot {
  startTime: string;
  endTime: string;
}

interface Availability {
  date: string;
  slots: Slot[];
}

const Availability = () => {
  const [availability, setAvailability] = useState<Availability[]>([
    {
      date: "",
      slots: [
        {
          startTime: "",
          endTime: "",
        },
      ],
    },
  ]);

  const addAnotherDate = () => {
    if (availability.length >= 15) {
      toast.error("You cannot add availability for upto 15 dates");
      return;
    }

    setAvailability((prev) => [
      ...prev,
      {
        date: "",
        slots: [
          {
            startTime: "",
            endTime: "",
          },
        ],
      },
    ]);
  };

  const addSlot = (dayIndex: number) => {
    const updatedAvailability = [...availability];

    updatedAvailability[dayIndex].slots.push({
      startTime: "",
      endTime: "",
    });

    setAvailability(updatedAvailability);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    if (availability[dayIndex].slots.length === 1) {
      toast.error("A date must have atleast one slot");
      return;
    }

    const updatedAvailability = [...availability];

    updatedAvailability[dayIndex].slots.splice(slotIndex, 1);

    setAvailability(updatedAvailability);
  };

  const removeDate = (dayIndex: number) => {
    if (availability.length === 1) {
      toast.error("Atleast one date is required");
      return;
    }

    const updatedAvailability = [...availability];

    updatedAvailability.splice(dayIndex, 1);

    setAvailability(updatedAvailability);
  };

  const validateAvailability = () => {
    for (const day of availability) {
      if (!day.date) {
        toast.error("Please fill all the dates");

        return false;
      }

      for (const slot of day.slots) {
        if (!slot.startTime || !slot.endTime) {
          toast.error("Please fill all slot timings");
          return false;
        }

        if (slot.startTime >= slot.endTime) {
          toast.error("Start time must be before end time");
          return false;
        }

        const [startHour, startMinute] = slot.startTime.split(":").map(Number);
        const [endHour, endMinute] = slot.endTime.split(":").map(Number);

        if (startMinute !== endMinute) {
          toast.error("Start and end time should have same minutes");
          return false;
        }

        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;

        if (endTotalMinutes - startTotalMinutes < 60) {
          toast.error("A slot must be atleast 1 hour long");
          return false;
        }
      }
    }

    const uniqueDates = new Set<string>();
    for (const day of availability) {
      if (uniqueDates.has(day.date)) {
        toast.error("Duplicate dates are not allowed");
        return false;
      }

      uniqueDates.add(day.date);
    }

    return true;
  };

  const oldAvailability = async () => {
    try {
      const res = await api.get("/mentor/availability");

      setAvailability(res.data.data);
    } catch (error: any) {
      toast.error(error.response.data.message ?? "Something went wrong");
    }
  };

  const handleSave = async () => {
    if (!validateAvailability()) {
      return;
    }

    try {
      const res = await api.patch("/mentor/availability", {
        availability: availability,
      });
      toast.success(res.data.message);
    } catch (error: any) {
      toast.error(error.response.data.message ?? "Something went wrong");
    }
  };

  useEffect(() => {
    oldAvailability();
  }, []);

  return (
    <div>
      <h1>Availability</h1>

      <div className="space-y-6">
        {availability.map((day, dayIndex) => (
          <div key={dayIndex}>
            <div key={dayIndex} className="border rounded-lg p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Date {dayIndex + 1}
              </h2>

              <label className="block mb-2 font-medium">Date</label>

              <input
                type="date"
                value={day.date}
                onChange={(e) => {
                  const updated = [...availability];
                  updated[dayIndex].date = e.target.value;

                  setAvailability(updated);
                }}
                className="border rounded-lg p-2 w-full"
              />

              <div className="mt-5 space-y-4">
                {day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex}>
                    <div key={slotIndex} className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2">Start Time</label>

                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => {
                            const updated = [...availability];
                            updated[dayIndex].slots[slotIndex].startTime =
                              e.target.value;

                            setAvailability(updated);
                          }}
                          className="border rounded-lg p-2 w-full"
                        />
                      </div>

                      <div>
                        <label className="block mb-2">End Time</label>

                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => {
                            const updated = [...availability];
                            updated[dayIndex].slots[slotIndex].endTime =
                              e.target.value;

                            setAvailability(updated);
                          }}
                          className="border rounded-lg p-2 w-full"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeSlot(dayIndex, slotIndex)}
                      className="text-red-500 mt-3 border border-black px-3 py-2 rounded-lg"
                    >
                      Remove Slot
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addSlot(dayIndex)}
                  className="mt-3 border border-black px-3 py-2 rounded-lg"
                >
                  + Add Slot
                </button>
              </div>
            </div>

            <button
              onClick={() => removeDate(dayIndex)}
              className="text-red-500 mt-3 border border-black px-3 py-2 rounded-lg"
            >
              Remove Date
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addAnotherDate}
        className="mt-4 border border-black px-4 py-2 rounded-lg"
      >
        + Add Another Date
      </button>

      <button
        onClick={handleSave}
        className="mt-4 border border-black px-4 py-2 rounded-lg "
      >
        Save
      </button>
    </div>
  );
};

export default Availability;
