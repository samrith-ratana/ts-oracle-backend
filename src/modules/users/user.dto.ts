import { z } from 'zod';

// #region --- Zod Schemas for Validation ---

// Schema for validating the request body when CREATING a new user.
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Not a valid email address"),
  // You might also validate the password here, e.g., .min(8)
});

// Schema for validating the request body when UPDATING a user.
// .partial() makes all fields optional, as a client might only update one field at a time.
export const updateUserSchema = createUserSchema.partial();

// #endregion --- Zod Schemas for Validation ---


// #region --- TypeScript Types and Interfaces ---

// DTO for creating a user, inferred directly from the Zod schema.
// This is the shape of the validated `req.body` for POST requests.
export type CreateUserDto = z.infer<typeof createUserSchema>;

// DTO for updating a user, inferred from its Zod schema.
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

// DTO for data we SEND BACK to the client in a response.
// This defines the public "contract" of our User object, omitting sensitive fields.
export interface UserDto {
  id: number;
  name: string;
  email: string;
}

// The internal User model, representing the full object (e.g., from a database).
// This includes sensitive data that should NEVER be sent to the client.
export interface User extends UserDto {
  passwordHash: string;
}

// #endregion --- TypeScript Types and Interfaces ---