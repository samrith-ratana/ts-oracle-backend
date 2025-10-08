// src/server.ts
import dotenv from 'dotenv';
import app from './app';
import { initialize as initializeDatabase } from './config/database';
import { setupUserTable } from './pool.table/tbl-users';


dotenv.config();
const port = process.env.PORT;

initializeDatabase()
  .then(async () => {
    // After the pool is ready, run our table setup script
    await setupUserTable(); 

    // Now, start the Express server
    app.listen(port, () => {
      console.log(`🚀 Server is running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error("Failed to initialize or start server", err);
  });