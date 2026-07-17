import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerDemo({ value, onChange }) {
  const isValidDate = value instanceof Date && !isNaN(value);

  // Get tomorrow's date only (to disable past/today dates)
  const tomorrowDateOnly = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Get time string (HH:MM) from the Date value
  const timeString = React.useMemo(() => {
    if (!isValidDate) return "12:00";
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [value, isValidDate]);

  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;
    
    const newDate = new Date(selectedDate);
    if (isValidDate) {
      // Keep existing hours/minutes
      newDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
    } else {
      // Default to 12:00 PM tomorrow
      newDate.setHours(12, 0, 0, 0);
    }
    onChange(newDate);
  };

  const handleTimeChange = (e) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const baseDate = isValidDate ? new Date(value) : (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
    })();
    baseDate.setHours(hours, minutes, 0, 0);
    onChange(baseDate);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Deadline Date & Time</label>
      <div className="flex gap-2 items-center">
        <Popover className="bg-black">
          <PopoverTrigger className="bg-black" asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[180px] justify-start text-left font-normal bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white",
                !isValidDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-purple-400" />
              {isValidDate ? format(value, "PP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-850" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              disabled={(date) => date < tomorrowDateOnly}
              initialFocus
              className="bg-zinc-950 text-white"
            />
          </PopoverContent>
        </Popover>

        {/* Time Picker input */}
        <input
          type="time"
          value={timeString}
          onChange={handleTimeChange}
          className="bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-md px-2 text-sm focus:outline-none focus:border-purple-500/50 hover:bg-zinc-900 transition-colors w-[100px] h-9 select-none"
        />
      </div>
    </div>
  );
}

export default DatePickerDemo;
