'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
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
import { useCreateMyTeamTaskMutation } from "@/services/mutations"

export function Create({ userMail, teamId }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 1,
    end_d: null,
    taskStatus: 'ongoing',
    userMail: userMail,
    teamName: teamId,
    assign_to:[]
  })

  const [open, setOpen] = useState(false)
  const mutation = useCreateMyTeamTaskMutation()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    console.log("Form updated:", form)
  }

  const handlePriorityChange = (value) => {
    setForm(prev => ({ ...prev, priority: value }))
    console.log("Priority updated:", value)
  }

  const handleDateChange = (date) => {
    if (date instanceof Date) {
        setForm(prev => ({ ...prev, end_d: date.toISOString() }));
    } else {
        setForm(prev => ({ ...prev, end_d: new Date(date).toISOString() }));
    }
    console.log(typeof form.end_d); // Outputs: 'string'
    console.log(form.end_d); // Outputs the ISO string representation of the date
};
  
  const handleAssignToChange = (e) => {
    const value = e.target.value;
    // Split by comma and trim each item
    setForm(prev => ({ ...prev, assign_to: value.split(",").map(email => email.trim()) }));
  };
  

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      priority: 1,
      end_d: '',
      taskStatus: 'ongoing',
      userMail: userMail,
      teamName: teamId,
      assign_to:[]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form:", form);
  
    if (!form.title.trim()) {
      alert("Please enter a title");
      return;
    }
  
    try {
      const result = await mutation.mutateAsync(
        {
          ...form,
          userArray: form.assign_to, // Map assign_to to userArray
        },
        {
          onSuccess: (data) => {
            console.log("Task created successfully:", data);
            resetForm();
            setOpen(false); // Close the sheet after successful submission
          },
          onError: (error) => {
            console.error("Mutation error:", error);
            console.error("Error response:", error.response?.data);
            alert("Failed to create task: " + (error.response?.data?.message || error.message));
          },
        }
      );
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error creating task. Please try again.");
    }
  };
  

  return (
    <div className="fixed bottom-5 right-5">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className='bg-zinc-950 text-zinc-100 rounded-full hover:bg-zinc-900 hover:text-zinc-100 w-10 p-0'
          >
            <Plus />
          </Button>
        </SheetTrigger>
        <SheetContent className='bg-black text-white'>
          <form onSubmit={handleSubmit}>
            <SheetHeader>
              <SheetTitle className='text-white text-2xl font-bold'>Create a task</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-8 mt-5">
              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  onChange={handleChange}
                  id="title"
                  name='title'
                  value={form.title}
                  className="col-span-3 bg-black text-white"
                  required
                />
              </div>
              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  onChange={handleChange}
                  id="description"
                  name='description'
                  value={form.description}
                  className="col-span-3 bg-black text-white"
                />
              </div>
              <div>
                <SelectDemo
                  value={form.priority}
                  onValueChange={handlePriorityChange}
                />
              </div>
              <div>
              <DatePickerDemo
                  value={form.end_d ? new Date(form.end_d) : null} // Convert ISO string back to Date
                  onChange={handleDateChange}
              />
              <div className="flex flex-col items-start gap-2 mt-6">
                <Label htmlFor="assign_to" className="text-right">
                    Assign to People (comma-separated emails)
                </Label>
                <Input
                    onChange={handleAssignToChange} // Use the new handler
                    id="assign_to"
                    name="assign_to"
                    value={form.assign_to.join(", ")} // Display as comma-separated
                    className="col-span-3 bg-black text-white"
                    required
                />
                </div>


              </div>
              <SheetFooter>
                <Button
                  type="submit"
                  className='border border-zinc-800 bg-black'
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? 'Creating...' : 'Create Task'}
                </Button>
              </SheetFooter>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default Create