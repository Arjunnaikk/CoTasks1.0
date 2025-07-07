import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { user } from '../database/schema';

//Create Schemas and Validators
export const createUserSchema = z.object({
  name: z.string().max(20),  
  gmail: z.string().max(200).email(),
  address: z.string().max(150).optional(), 
  phone: z.number().int().max(10).optional(), 
  password: z.string().max(20).optional(), 
});

export const createUserValidator = zValidator('json', createUserSchema);

export const createListSchema = z.object({
  name: z.string().max(20),  
  user_gmail: z.string().email().max(200),
});

export const createListValidator = zValidator('json', createListSchema);


export const createTaskSchema = z.object({
  title: z.string().max(50),
  description: z.string().max(300),
  status: z.string().max(10).optional(),
  end_d: z.string().max(30).optional(),
  priority: z.number().int().max(5).optional(),
  user_gmail: z.string().max(200).email(),
  list_name: z.string().max(30)
});


export const createTaskValidator = zValidator('json', createTaskSchema);



export const createTask_assignedSchema = z.object({
  user_gmail: z.string().max(200).email(),
  task_id : z.number().int().max(9999)
});


export const createTask_assignedValidator = zValidator('json', createTask_assignedSchema);

export const createTeamSchema = z.object({
  title: z.string().max(50),
});


export const createTeamValidator = zValidator('json', createTeamSchema);

export const createUser_teamSchema = z.object({
  team_id: z.number().int().max(9999),
  user_gmail : z.string().max(200).email()
});

export const createUser_teamValidator = zValidator('json', createUser_teamSchema);

export const createFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(300).optional(),
  user_gmail:z.string().max(200).email()
});

export const createFeedbackValidator = zValidator('json', createFeedbackSchema);





// Get Schemas and Validators


export const getUserSchema = z.object({
});
export const getUserValidator = zValidator('json', getUserSchema);
// export const getFeedbackSchema = z.object({
// });
  
// export const getFeedbackValidator = zValidator('json', getFeedbackSchema);



/// Patch Schema and Validator


export const updateUserSchema = z.object({
  user_gmail :  z.string().max(200).email(),
  name : z.string().max(30).optional(),
  phone: z.number().int().max(10).optional()
});

export const updateUserValidator = zValidator('json', updateUserSchema);





