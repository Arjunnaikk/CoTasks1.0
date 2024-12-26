'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const people = [
  { value: "alice@example.com", label: "Alice Johnson" },
  { value: "bob@example.com", label: "Bob Smith" },
  { value: "charlie@example.com", label: "Charlie Brown" },
  { value: "david@example.com", label: "David Lee" },
  { value: "eva@example.com", label: "Eva Martinez" },
  // Add more people as needed
]

export function PeopleSelect({ value, onChange }) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredPeople = people.filter(person =>
    person.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value.length > 0
            ? `${value.length} selected`
            : "Select people..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search people..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>No person found.</CommandEmpty>
          <CommandGroup>
            {filteredPeople.map((person) => (
              <CommandItem
                key={person.value}
                onSelect={() => {
                  onChange(
                    value.includes(person.value)
                      ? value.filter((v) => v !== person.value)
                      : [...value, person.value]
                  )
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value.includes(person.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {person.label} ({person.value})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

