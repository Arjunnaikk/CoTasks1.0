import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cotask.somprajapati24-dcf.workers.dev";

//myTask
export function useGetMyTaskQuery(userGmail, listName) {
  return useQuery({
    queryKey: ["getTask", userGmail, listName],
    queryFn: async () => {
      const response = await axios.post(
        `${API_BASE_URL}/myTask/fetch`,
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
        `${API_BASE_URL}/teamTask/fetch`,
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
          `${API_BASE_URL}/user/fetch`
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
          `${API_BASE_URL}/list/fetch`,
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
        `${API_BASE_URL}/team/fetch`,
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
        `${API_BASE_URL}/taskAssigned/fetch`,
        {
          team_name,
          task_id: parseInt(task_id, 10)
        }
      );
      return response.data;  // Only return the data part
    },
  });
}

//Get team members
export function useGetTeamMembersQuery(teamName) {
  return useQuery({
    queryKey: ["getTeamMembers", teamName],
    queryFn: async () => {
      const response = await axios.post(
        `${API_BASE_URL}/team/members`,
        {
          team_name: teamName
        }
      );
      return response.data;
    },
    enabled: !!teamName,
    refetchInterval: 10000, // Poll every 10 seconds for user activity/presence status
  });
}

//Get team messages
export function useGetTeamMessagesQuery(teamName) {
  return useQuery({
    queryKey: ["getTeamMessages", teamName],
    queryFn: async () => {
      const response = await axios.post(
        `${API_BASE_URL}/team/message/fetch`,
        {
          team_name: teamName
        }
      );
      return response.data;
    },
    enabled: !!teamName,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });
}

//Get team unread counts
export function useGetUnreadCountsQuery(userGmail) {
  return useQuery({
    queryKey: ["getTeamUnreadCounts", userGmail],
    queryFn: async () => {
      const response = await axios.post(
        `${API_BASE_URL}/team/unread_counts`,
        {
          user_gmail: userGmail
        }
      );
      return response.data;
    },
    enabled: !!userGmail,
    refetchInterval: 5000, // Poll every 5 seconds for unread notifications
  });
}

//Get subtasks for a task
export function useGetSubtasksQuery(taskId) {
  return useQuery({
    queryKey: ["getSubtasks", taskId],
    queryFn: async () => {
      const response = await axios.post(
        `${API_BASE_URL}/subtask/fetch`,
        {
          task_id: parseInt(taskId, 10)
        }
      );
      return response.data;
    },
    enabled: !!taskId && taskId !== '10',
  });
}

//Get comments for a task
export function useGetTaskCommentsQuery(taskId) {
  return useQuery({
    queryKey: ["getTaskComments", taskId],
    queryFn: async () => {
      const response = await axios.post(
        `${API_BASE_URL}/comment/fetch`,
        {
          task_id: parseInt(taskId, 10)
        }
      );
      return response.data;
    },
    enabled: !!taskId && taskId !== '10',
  });
}

//Get recent activity logs for a team
export function useGetTeamActivityQuery(teamName) {
  return useQuery({
    queryKey: ["getTeamActivity", teamName],
    queryFn: async () => {
      const response = await axios.post(
        `${API_BASE_URL}/team/activity/fetch`,
        {
          team_name: teamName
        }
      );
      return response.data;
    },
    enabled: !!teamName,
    refetchInterval: 10000, // Poll every 10 seconds for live updates
  });
}