import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function AlertDialogDemo({ isSelected2, handleListDelete, handleTeamDelete }) {
  return (
      <AlertDialog>
          <AlertDialogTrigger asChild>
              <Button
                  onClick={(event) => {
                      event.stopPropagation()
                  }}
                  className={`bg-[rgb(9 9 11)] hover:bg-[rgb(9 9 11)] p-1 h-10 w-10 hover:text-red-600 text-4xl`}
              >
                  <Trash2
                      size={24} 
                      className={`opacity-0 group-hover:opacity-100 
                          ${isSelected2 ? 'hover:text-red-600 opacity-100' : 'hover:text-red-600'}
                          cursor-pointer transition-opacity transition-transform duration-200 
                          hover:scale-125 hover:rotate-6`}
                  />
              </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  list and remove all the tasks from that list.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                      onClick={(event) => {
                          event.stopPropagation();
                          if (handleListDelete) {
                            handleListDelete();
                        } else {
                            handleTeamDelete();
                        }
                        }
                      }
                  >
                      Continue
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
  );
}

export default AlertDialogDemo;
