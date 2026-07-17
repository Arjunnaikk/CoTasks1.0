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

//Send Team Message
export function useSendTeamMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["sendTeamMessage"],
    mutationFn: async ({ teamName, userGmail, content }) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/team/message/send`,
          JSON.stringify({
            team_name: teamName,
            user_gmail: userGmail,
            content: content
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
      queryClient.invalidateQueries({ queryKey: ["getTeamMessages", variables.teamName] });
    },
    retry: false,
  });
}

//Delete Team Message
export function useDeleteTeamMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteTeamMessage"],
    mutationFn: async ({ messageId, userGmail }) => {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/team/message/delete`,
          {
            headers: { 
              "Content-Type": "application/json",
            },
            data: JSON.stringify({
              message_id: messageId,
              user_gmail: userGmail
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
      queryClient.invalidateQueries({ queryKey: ["getTeamMessages"] });
    },
    retry: false,
  });
}

//Mark Team Messages as Read
export function useMarkTeamMessageAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["markTeamMessageAsRead"],
    mutationFn: async ({ teamName, userGmail }) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/team/message/read`,
          JSON.stringify({
            team_name: teamName,
            user_gmail: userGmail
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
      queryClient.invalidateQueries({ queryKey: ["getTeamUnreadCounts", variables.userGmail] });
    },
    retry: false,
  });
}

//Create Subtask
export function useCreateSubtaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createSubtask"],
    mutationFn: async ({ taskId, title, userGmail }) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/subtask/create`,
          JSON.stringify({
            task_id: parseInt(taskId, 10),
            title: title,
            user_gmail: userGmail
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
      queryClient.invalidateQueries({ queryKey: ["getSubtasks", String(variables.taskId)] });
    },
    retry: false,
  });
}

//Toggle Subtask
export function useToggleSubtaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["toggleSubtask"],
    mutationFn: async ({ subtaskId, isCompleted, taskId, userGmail }) => {
      try {
        const response = await axios.patch(
          `${API_BASE_URL}/subtask/toggle`,
          JSON.stringify({
            subtask_id: subtaskId,
            is_completed: isCompleted,
            user_gmail: userGmail
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
      queryClient.invalidateQueries({ queryKey: ["getSubtasks", String(variables.taskId)] });
    },
    retry: false,
  });
}

//Delete Subtask
export function useDeleteSubtaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteSubtask"],
    mutationFn: async ({ subtaskId, taskId }) => {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/subtask/delete`,
          {
            headers: { 
              "Content-Type": "application/json",
            },
            data: JSON.stringify({
              subtask_id: subtaskId
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
      queryClient.invalidateQueries({ queryKey: ["getSubtasks", String(variables.taskId)] });
    },
    retry: false,
  });
}

//Create Task Comment
export function useCreateTaskCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createTaskComment"],
    mutationFn: async ({ taskId, userGmail, content }) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/comment/create`,
          JSON.stringify({
            task_id: parseInt(taskId, 10),
            user_gmail: userGmail,
            content: content
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
      queryClient.invalidateQueries({ queryKey: ["getTaskComments", String(variables.taskId)] });
    },
    retry: false,
  });
}

//Delete Task Comment
export function useDeleteTaskCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteTaskComment"],
    mutationFn: async ({ commentId, taskId, userGmail }) => {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/comment/delete`,
          {
            headers: { 
              "Content-Type": "application/json",
            },
            data: JSON.stringify({
              comment_id: commentId,
              user_gmail: userGmail
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
      queryClient.invalidateQueries({ queryKey: ["getTaskComments", String(variables.taskId)] });
    },
    retry: false,
  });
}

//Toggle Emoji Reaction
export function useToggleReactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["toggleReaction"],
    mutationFn: async ({ messageId, userGmail, emoji, teamName }) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/team/message/react`,
          JSON.stringify({
            message_id: messageId,
            user_gmail: userGmail,
            emoji: emoji
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
      queryClient.invalidateQueries({ queryKey: ["getTeamMessages", variables.teamName] });
    },
    retry: false,
  });
}

//Ping User Active Status
export function usePingUserMutation() {
  return useMutation({
    mutationKey: ["pingUser"],
    mutationFn: async ({ userGmail }) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/user/ping`,
          JSON.stringify({
            user_gmail: userGmail
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
    retry: false,
  });
}

//Update Member Role
export function useUpdateMemberRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateMemberRole"],
    mutationFn: async ({ teamName, targetGmail, role, userGmail }) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/team/role/update`,
          JSON.stringify({
            team_name: teamName,
            target_gmail: targetGmail,
            role,
            user_gmail: userGmail,
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
      queryClient.invalidateQueries({ queryKey: ["getTeamMembers", variables.teamName] });
    },
    retry: false,
  });
}