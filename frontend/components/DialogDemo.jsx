'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateListMutation } from "@/services/mutations"

export function DialogDemo({ email }) {
    const [title, setTitle] = useState('')
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const mutation = useCreateListMutation()

    const maxLength = 20;
    
    const handleChange = (e) => {
        setTitle(e.target.value)
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
    //   console.log("Submitting title:", title) // Debug log

      if (!title.trim()) return
      
      try {
        const result = await mutation.mutateAsync(
          { title: title.trim(),email }, // Make sure to send the title in the correct format
          {
            onSuccess: (data) => {
              console.log("Success:", data)
              router.push(`/mypage/`)
              setTitle('')
              setOpen(false)
            },
            onError: (error) => {
              console.error("Mutation error:", error)
              alert("Failed to create list: " + error.message)
            },
          }
        )
      } catch (error) {
        console.error("Submit error:", error)
        alert("Error creating list: " + error.message)
      }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    className='w-[20vw] h-[40px] bg-zinc-950 text-white hover:bg-zinc-900 hover:text-white'
                >
                    Create
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950">
                <DialogHeader>
                    <DialogTitle className='text-white'>Create List</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Create a new list to organize your tasks.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-white">
                Name
            </Label>
            <div className="col-span-3">
                <Input 
                    onChange={handleChange}
                    id="name"
                    name="title"
                    value={title}
                    className="bg-zinc-900 border-zinc-800 text-white"
                    placeholder="Enter list name"
                    required
                    maxLength={maxLength}
                />
                {title.length >= 10 &&
                <p className={`text-xs mt-1 ${title.length >= maxLength ? "text-red-500" : "text-gray-400"}`}>
                    {title.length}/{maxLength} characters
                </p>
                }
            </div>
        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="submit"
                            className="bg-zinc-800 text-white hover:bg-zinc-700"
                            disabled={mutation.isLoading}
                        >
                            {mutation.isLoading ? 'Creating...' : 'Create List'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default DialogDemo