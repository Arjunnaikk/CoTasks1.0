import axios from "axios";
import { useMutation } from "@tanstack/react-query";

//Create User
export function useCreateUserMutation() {
  return useMutation({
    mutationKey: ["createUser"],
    mutationFn: async ({ name, gmail, imgText}) => {
      console.log('imgText',imgText)
      try {
        const response = await axios.post(
          "https://cotask.somprajapati24-dcf.workers.dev/user/create",
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
        throw error; // Allows onError to catch this error in the calling component
      }
    },
    retry: false, // Keeps retry disabled for specific control
  });
}


//Create List
export function useCreateListMutation() {
  return useMutation({
    mutationKey: ["createList"],
    mutationFn: async ({ title,email }) => {
      // Log the request data
      console.log("Sending data:", JSON.stringify({ name: title })); // Changed title to name
      
      return (
        await axios.post(
          "https://cotask.somprajapati24-dcf.workers.dev/list/create",
          JSON.stringify({ name: title, user_gmail:email }), // Send as stringified JSON with 'name' key
          {
            headers: { 
              "Content-Type": "application/json",
            },
          }
        )
      ).data;
    },
    retry: false,
  });
}



//Create Team
export function useCreateTeamMutation() {
  return useMutation({
    mutationKey: ["createTeam"],
    mutationFn: async ({ title, names }) => {
      // Log the correct request data
      console.log("Sending data:", JSON.stringify({ title: title, user_array: names }));

      return (
        await axios.post(
          "https://cotask.somprajapati24-dcf.workers.dev/team/create",
          JSON.stringify({ title: title, user_array: names }), // Send as stringified JSON with 'title' and 'user_array' keys
          {
            headers: { 
              "Content-Type": "application/json",
            },
          }
        )
      ).data;
    },
    retry: false,
  });
}


//Update Team Task
export function useUpdateTaskStatusMutation() {
  return useMutation({
    mutationKey: ["updateTask"],
    mutationFn: async ({ title, names, status }) => {
      // Log the correct request data
      console.log("Sending data:", JSON.stringify({ user_gmail : title, task_name: names, status: status }));

      return (
        await axios.post(
          "https://cotask.somprajapati24-dcf.workers.dev/myTask/update",
          JSON.stringify({ title: title, user_array: names }), // Send as stringified JSON with 'title' and 'user_array' keys
          {
            headers: { 
              "Content-Type": "application/json",
            },
          }
        )
      ).data;
    },
    retry: false,
  });
}




//Create Task
// export function useCreateMyTaskMutation() {
//   return useMutation({
//     mutationKey: ["createMyTask"],
//     mutationFn: async ({ title, description, priority, end_d, taskStatus, userMail, listName }) => {
//       // Log the request data
//       // console.log("Sending data:", JSON.stringify({ name: title })); // Changed title to name
      
//       return (
//         await axios.post(
//           "https://cotask.somprajapati24-dcf.workers.dev/myTask/create",
//           JSON.stringify({ title, description,status:taskStatus, end_d, priority, user_gmail:userMail,list_name:listName }), // Send as stringified JSON with 'name' key
//           {
//             headers: { 
//               "Content-Type": "application/json",
//             },
//           }
//         )
//       ).data;
//     },
//     retry: false,
//   });
// }

export function useCreateMyTaskMutation() {
  return useMutation({
    mutationKey: ["createTask"],
    mutationFn: async ({ title, description, priority, end_d, taskStatus, userMail, listName }) => {
      // console.log("Sending task data:", { title, description, priority, end_d, taskStatus, userMail, listName });
    //   console.log(typeof formattedEndD); // Outputs: 'object'
    // console.log(formattedEndD instanceof Date); // Outputs: true

      try {
        const response = await axios.post(
          "https://cotask.somprajapati24-dcf.workers.dev/myTask/create",
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
        throw error; // Allows onError to catch this error in the calling component
      }
    },
    retry: false, // Keeps retry disabled for specific control
  });
}


//Create My Team Task
export function useCreateMyTeamTaskMutation() {
  return useMutation({
    mutationKey: ["createTeamTask"],
    mutationFn: async ({ title, description, priority, end_d, taskStatus, userMail, teamName , userArray }) => {
      try {
        const response = await axios.post(
          "https://cotask.somprajapati24-dcf.workers.dev/teamTask/create",
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
        throw error; // Allows onError to catch this error in the calling component
      }
    },
    retry: false, // Keeps retry disabled for specific control
  });
}


export function useDeleteMyTaskMutation() {
  return useMutation({
    mutationKey: ["deleteTask"],
    mutationFn: async ({ userMail, taskId }) => {
      // console.log("Deleting task data:");
    //   console.log(typeof formattedEndD); // Outputs: 'object'
    // console.log(formattedEndD instanceof Date); // Outputs: true

    try {
    const response = await axios.delete(
      "https://cotask.somprajapati24-dcf.workers.dev/myTask/delete",
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
        throw error; // Allows onError to catch this error in the calling component
      }
    },
    retry: false, // Keeps retry disabled for specific control
  });
}