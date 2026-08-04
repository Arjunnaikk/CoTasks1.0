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

const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  return tomorrow;
};

export function Create({ userMail, listId }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 1,
    end_d: getTomorrow().toISOString(),
    taskStatus: 'backlog',
    userMail: userMail,
    listName: listId
  })

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
      const result = await mutation.mutateAsync(
        {
          ...form,
          userArray: form.assign_to,
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
          <Button
            variant="outline"
            className="bg-zinc-950 text-zinc-100 rounded-xl hover:bg-zinc-900 border border-zinc-800 hover:text-zinc-100 w-[11vw] min-w-[70px] max-w-[120px] p-0 active:scale-95 duration-150 transition-transform"
          >
            <Plus className="w-4 h-4" />
          </Button>
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