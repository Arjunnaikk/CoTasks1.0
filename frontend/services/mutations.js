import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cotask.somprajapati24-dcf.workers.dev";

//Create User
export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createUser"],
    mutationFn: async ({ name, gmail, imgText}) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/user/create`,
          JSON.stringify({
            name,
            gmail,
            imgtext: imgText
          }),
          {
            headers: { 
              "Content-Type": "application/json",
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error("API call error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getUser"] });
    },
    retry: false,
  });
}


//Create List
export function useCreateListMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createList"],
    mutationFn: async ({ title, email }) => {
      return (
        await axios.post(
          `${API_BASE_URL}/list/create`,
          JSON.stringify({ name: title, user_gmail:email }),
          {
            headers: { 
              "Content-Type": "application/json",
            },
          }
        )
      ).data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["getList", variables.email] });
    },
    retry: false,
  });
}



//Create Team
export function useCreateTeamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createTeam"],
    mutationFn: async ({ title, names }) => {
      return (
        await axios.post(
          `${API_BASE_URL}/team/create`,
          JSON.stringify({ title: title, user_array: names }),
          {
            headers: { 
              "Content-Type": "application/json",
            },
          }
        )
      ).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getTeam"] });
    },
    retry: false,
  });
}


//Update Team Task
export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateTask"],
    mutationFn: async ({ user_gmail, task_name, status }) => {
      return (
        await axios.patch(
          `${API_BASE_URL}/myTask/update`,
          JSON.stringify({ 
            user_gmail,
            task_name,
            status
          }),
          {
            headers: { 
              "Content-Type": "application/json",
            },
          }
        )
      ).data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["getTask"] });
      queryClient.invalidateQueries({ queryKey: ["getMyTask"] });
    },
    retry: false,
  });
}




//Create Task
export function useCreateMyTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createTask"],
    mutationFn: async ({ title, description, priority, end_d, taskStatus, userMail, listName }) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/myTask/create`,
          JSON.stringify({
            title,
            description,
            status: taskStatus,
            end_d:end_d,
            priority,
            user_gmail: userMail,
            list_name: listName,
          }),
          {
            headers: { 
              "Content-Type": "application/json",
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error("API call error:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["getTask", variables.userMail, variables.listName] });
    },
    retry: false,
  });
}


//Create My Team Task
export function useCreateMyTeamTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createTeamTask"],
    mutationFn: async ({ title, description, priority, end_d, taskStatus, userMail, teamName , userArray }) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/teamTask/create`,
          JSON.stringify({
            title,
            description,
            status: taskStatus,
            end_d:end_d,
            priority,
            user_gmail: userMail,
            team_name: teamName,
            user_array:userArray
          }),
          {
            headers: { 
              "Content-Type": "application/json",
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error("API call error:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["getMyTask", variables.userMail, variables.teamName] });
    },
    retry: false,
  });
}


//Delete MyTask
export function useDeleteMyTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteTask"],
    mutationFn: async ({ userMail, taskId }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/myTask/delete`,
        {
          headers: { 
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            user_gmail: userMail,
            task_id: taskId
          }),
        }
      );
      return response.data;
    } catch (error) {
        console.error("API call error:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["getTask"] });
    },
    retry: false,
  });
}

//Delete List
export function useDeleteListMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteList"],
    mutationFn: async ({ userMail, name }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/list/delete`,
        {
          headers: { 
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            user_gmail: userMail,
            name: name
          }),
        }
      );
      return response.data;
    } catch (error) {
        console.error("API call error:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["getList", variables.userMail] });
    },
    retry: false,
  });
}

//Delete Team
export function useDeleteTeamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteTeam"],
    mutationFn: async ({ userMail, teamName }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/team/delete`,
        {
          headers: { 
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            user_gmail: userMail,
            team_name: teamName
          }),
        }
      );
      return response.data;
    } catch (error) {
        console.error("API call error:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["getTeam", variables.userMail] });
    },
    retry: false,
  });
}



//Delete Team Task
export function useDeleteTeamTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteTeamTask"],
    mutationFn: async ({ teamName, taskId }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/teamTask/delete`,
        {
          headers: { 
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            task_id: taskId,
            team_name: teamName
          }),
        }
      );
      return response.data;
    } catch (error) {
        console.error("API call error:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["getMyTask"] });
      queryClient.invalidateQueries({ queryKey: ["getAssigned"] });
    },
    retry: false,
  });
}