// src/app.ts
import express, { Application } from 'express';
import { UserController } from './modules/users/user.controller';

const app: Application = express();

app.use(express.json());

// Routes
app.get('/api', (req, res) => res.send('API is running...'));
app.use('/api/users', UserController);

export default app;