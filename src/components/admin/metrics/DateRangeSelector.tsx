import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, startOfDay, startOfMonth, startOfYear, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface DateRangeSelectorProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export const DateRangeSelector = ({ date, setDate }: DateRangeSelectorProps) => {
  const handleQuickSelect = (value: string) => {
    const today = new Date();
    switch (value) {
      case "today":
        setDate({
          from: startOfDay(today),
          to: endOfDay(today)
        });
        break;
      case "month":
        setDate({
          from: startOfMonth(today),
          to: today
        });
        break;
      case "year":
        setDate({
          from: startOfYear(today),
          to: today
        });
        break;
      default:
        setDate(undefined);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal bg-[#232323] border-[#505050]",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <ToggleGroup type="single" onValueChange={handleQuickSelect}>
        <ToggleGroupItem value="today" className="bg-[#232323] border-[#505050]">
          Today
        </ToggleGroupItem>
        <ToggleGroupItem value="month" className="bg-[#232323] border-[#505050]">
          This Month
        </ToggleGroupItem>
        <ToggleGroupItem value="year" className="bg-[#232323] border-[#505050]">
          This Year
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};