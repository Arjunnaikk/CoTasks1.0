'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Plus } from "lucide-react"
import SelectDemo from "./SelectDemo"
import DatePickerDemo from "./DatePicker"
import { useCreateMyTaskMutation } from "@/services/mutations"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { createCalendarEvent } from "@/lib/gcalendar"

const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  return tomorrow;
};

export function Create({ userMail, listId, customTrigger }) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 1,
    end_d: getTomorrow().toISOString(),
    taskStatus: 'backlog',
    userMail: userMail,
    listName: listId
  })

  const [addToCalendar, setAddToCalendar] = useState(true)
  const [open, setOpen] = useState(false)
  const mutation = useCreateMyTaskMutation()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePriorityChange = (value) => {
    setForm(prev => ({ ...prev, priority: value }))
  }

  const handleDateChange = (date) => {
    if (date instanceof Date) {
        setForm(prev => ({ ...prev, end_d: date.toISOString() }));
    } else {
        setForm(prev => ({ ...prev, end_d: new Date(date).toISOString() }));
    }
};
  
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      priority: 1,
      end_d: getTomorrow().toISOString(),
      taskStatus: 'backlog',
      userMail: userMail,
      listName: listId
    })
    setAddToCalendar(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!form.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }
  
    try {
      console.log("[DEBUG] session in Create:", session);
      let gcalEventId = null;
      if (addToCalendar && session?.accessToken) {
        console.log("[DEBUG] calling createCalendarEvent with token:", session.accessToken.substring(0, 10) + "...");
        gcalEventId = await createCalendarEvent(session.accessToken, {
          title: form.title,
          descrption: form.description,
          start_d: new Date().toISOString(),
          end_d: form.end_d,
        });
        console.log("[DEBUG] createCalendarEvent returned gcalEventId:", gcalEventId);
      } else {
        console.log("[DEBUG] Skipping Google Calendar event creation.");
      }

      const result = await mutation.mutateAsync(
        {
          ...form,
          userArray: form.assign_to,
          gcal_event_id: gcalEventId,
        },
        {
          onSuccess: (data) => {
            toast({
              title: "Success",
              description: "Task created successfully",
              variant: "dark",
            });
            resetForm();
            setOpen(false);
          },
          onError: (error) => {
            console.error("Mutation error:", error);
            console.error("Error response:", error.response?.data);
            toast({
              title: "Error",
              description: "Failed to create task: " + (error.response?.data?.message || error.message),
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: "Error creating task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {customTrigger ? customTrigger : (
            <Button
              variant="outline"
              className="bg-[#18181b] border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center justify-center h-9 w-9 p-0 rounded-md shrink-0 active:scale-95 duration-150 transition-all"
            >
              <Plus className="w-4 h-4 text-purple-450" />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent className="bg-zinc-950 border-l border-zinc-900 text-white p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <SheetHeader className="text-left">
              <SheetTitle className="text-white text-xl font-bold tracking-tight">Create personal task</SheetTitle>
              <SheetDescription className="text-zinc-500 text-xs">Define a new pending task for this list workspace.</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-5 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Title
                </Label>
                <div className="w-full">
                  <Input
                    onChange={handleChange}
                    id="title"
                    name="title"
                    value={form.title}
                    className="w-full bg-[#18181b]/50 border-zinc-850 rounded-xl text-xs text-white focus-visible:ring-1 focus-visible:ring-purple-500/50"
                    placeholder="Enter task name..."
                    required
                    maxLength={50}
                  />
                  {form.title.length >= 40 && (
                    <p className={`text-[10px] mt-1 text-right ${form.title.length >= 50 ? "text-red-500" : "text-zinc-500"}`}>
                      {form.title.length} / 50 characters
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Description
                </Label>
                <div className="w-full">
                  <Textarea
                    onChange={handleChange}
                    id="description"
                    name="description"
                    value={form.description}
                    placeholder="Add detailed task notes..."
                    className="w-full bg-[#18181b]/50 border-zinc-850 rounded-xl text-xs text-white focus-visible:ring-1 focus-visible:ring-purple-500/50 resize-none h-28"
                    maxLength={300}
                  />
                  {form.description.length >= 250 && (
                    <p className={`text-[10px] mt-1 text-right ${form.description.length >= 300 ? "text-red-500" : "text-zinc-500"}`}>
                      {form.description.length} / 300 characters
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Priority</label>
                <SelectDemo
                  value={form.priority}
                  onValueChange={handlePriorityChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Due Date & Time</label>
                <DatePickerDemo
                  value={form.end_d ? new Date(form.end_d) : null}
                  onChange={handleDateChange}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl mt-2 select-none">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-200">Google Calendar Sync</span>
                  <span className="text-[10px] text-zinc-500">Add this task as a calendar event</span>
                </div>
                <input
                  type="checkbox"
                  checked={addToCalendar}
                  onChange={(e) => setAddToCalendar(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-purple-650 focus:ring-purple-500/50 focus:ring-offset-zinc-950 accent-purple-500 cursor-pointer"
                />
              </div>

              <SheetFooter className="pt-2">
                <Button
                  type="submit"
                  className="bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl w-full text-xs font-bold transition-all active:scale-95 duration-150 h-9 p-0"
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? "Creating..." : "Create Task"}
                </Button>
              </SheetFooter>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default Create;