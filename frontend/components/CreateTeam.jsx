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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Plus } from 'lucide-react'
import SelectDemo from "./SelectDemo"
import DatePickerDemo from "./DatePicker"
import { useCreateMyTeamTaskMutation } from "@/services/mutations"
import { PeopleSelect } from "./PeopleSelect"

const people = [
  { value: "alice@example.com", label: "Alice Johnson" },
  { value: "bob@example.com", label: "Bob Smith" },
  { value: "charlie@example.com", label: "Charlie Brown" },
  { value: "david@example.com", label: "David Lee" },
  { value: "eva@example.com", label: "Eva Martinez" },
  // Add more people as needed
]

export function Create({ userMail, teamId }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 1,
    end_d: null,
    taskStatus: 'ongoing',
    userMail: userMail,
    teamName: teamId,
    assign_to: []
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
    console.log(typeof form.end_d);
    console.log(form.end_d);
  };

  const handleAssignToChange = (selectedEmails) => {
    setForm(prev => ({ ...prev, assign_to: selectedEmails }));
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
      assign_to: []
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
          userArray: form.assign_to,
        },
        {
          onSuccess: (data) => {
            console.log("Task created successfully:", data);
            resetForm();
            setOpen(false);
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
                  value={form.end_d ? new Date(form.end_d) : null}
                  onChange={handleDateChange}
                />
              </div>
              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="assign_to" className="text-right">
                  Assign to People
                </Label>
                <PeopleSelect
                  value={form.assign_to}
                  onChange={handleAssignToChange}
                />
                {form.assign_to.length > 0 && (
                  <div className="mt-2 text-sm text-gray-400">
                    Selected: {form.assign_to.map(email =>
                      people.find(p => p.value === email)?.label
                    ).join(', ')}
                  </div>
                )}
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

