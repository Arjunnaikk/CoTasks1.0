import axios from "axios";
import { useQuery } from "@tanstack/react-query";

//myTask
export function useGetMyTaskQuery(userGmail, listName) {
  return useQuery({
    queryKey: ["getTask", userGmail, listName],
    queryFn: async () => {
      const response = await axios.post(
        "https://cotask.somprajapati24-dcf.workers.dev/myTask/fetch",
        {
          user_gmail: userGmail,
          list_name: listName
        }
      );
      return response.data;  // Only return the data part
    },
  });
}

//myTeamTask
export function useGetMyTeamTaskQuery(userGmail, TeamName) {
  return useQuery({
    queryKey: ["getMyTask", userGmail, TeamName],
    queryFn: async () => {
      const response = await axios.post(
        "https://cotask.somprajapati24-dcf.workers.dev/teamTask/fetch",
        {
          user_gmail: userGmail,
          team_name: TeamName
        }
      );
      return response.data;  // Only return the data part
    },
  });
}


//User
export function useGetUserQuery() {
  return useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "https://cotask.somprajapati24-dcf.workers.dev/user/fetch"
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw new Error(error.response?.data?.message || "Error fetching user data");
      }
    },
  });
}

//List
export function useGetListQuery(userMail){
  return useQuery({
    queryKey: ["getList",userMail],
    queryFn: async () =>{
      try{
        const response = await axios.post(
          "https://cotask.somprajapati24-dcf.workers.dev/list/fetch",
          {
            user_gmail:userMail
          }
        )
        return response.data
      }
      catch(error){
        console.error("Error fetching user list:", error);
        throw new Error(error.response?.data?.message || "Error fetching user data");
      }
    },
    enabled: !!userMail
  })
}

//team
export function useGetMyTeamQuery(userGmail) {
  return useQuery({
    queryKey: ["getTeam", userGmail],
    queryFn: async () => {
      const response = await axios.post(
        "https://cotask.somprajapati24-dcf.workers.dev/team/fetch",
        {
          user_gmail: userGmail
        }
      );
      return response.data;  // Only return the data part
    },
  });
}


//Assigned 
export function useGetAssignedQuery(team_name, task_id) {
  return useQuery({
    queryKey: ["getAssigned", team_name, task_id],
    queryFn: async () => {
      const response = await axios.post(
        "https://cotask.somprajapati24-dcf.workers.dev/taskAssigned/fetch",
        {
          team_name,
          task_id: parseInt(task_id, 10)
        }
      );
      return response.data;  // Only return the data part
    },
  });
}