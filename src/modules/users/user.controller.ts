// src/features/users/user.controller.ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validation.middleware';
import { createUserSchema } from './user.dto';
import { UserService } from './user.service';

const router = Router();
const userService = new UserService(); // In a real app, you'd inject this

// GET /api/users
router.get('/', (req: Request, res: Response) => {
  const users = userService.getAllUsers();
  res.status(200).json(users);
});

// GET /api/users/:id
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = userService.getUserById(id);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).send('User not found');
  }
});

// POST /api/users
router.post('/', validate(z.object({ body: createUserSchema })), (req: Request, res: Response) => {
  try {
    const newUser = userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error: any) {
    // Handle specific errors from the service layer
    res.status(409).send(error.message); // 409 Conflict
  }
});

export const UserController = router;