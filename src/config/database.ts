// src/config/database.ts

import oracledb from 'oracledb';

// Tell the driver where to find the Oracle Instant Client libraries
// This might be needed if it's not in your system's PATH
// oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_21_13' });

// Improve performance by mapping Oracle's snake_case columns to camelCase
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Main function to initialize the database connection pool
export async function initialize() {
  try {
    console.log('Initializing database connection pool...');
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 4,  // Minimum connections to keep open
      poolMax: 10, // Maximum connections in the pool
      poolIncrement: 1 // How many connections to open at a time
    });
    console.log('Database pool initialized successfully.');
  } catch (err) {
    console.error('Error initializing database pool:', err);
    process.exit(1); // Exit the application if the database fails to connect
  }
}

// Function to get a connection from the pool
export async function getConnection(): Promise<oracledb.Connection> {
  return oracledb.getConnection();
}