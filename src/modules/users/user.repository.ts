// src/features/users/user.repository.ts

import oracledb from 'oracledb';
import { getConnection } from '../../config/database';
import { User, UpdateUserDto } from './user.dto';

export class UserRepository {
  /**
   * Fetches all users from the database.
   */
  public async findAll(): Promise<User[]> {
    let connection: oracledb.Connection | undefined;
    try {
      connection = await getConnection();
      const result = await connection.execute<User>(
        // Alias snake_case columns to match our camelCase User model
        `SELECT id, name, email, password_hash as "passwordHash" FROM users ORDER BY id`
      );
      return result.rows || [];
    } catch (err) {
      console.error('Error in UserRepository.findAll:', err);
      throw new Error('Failed to fetch users.');
    } finally {
      if (connection) {
        await connection.close(); // Release connection back to the pool
      }
    }
  }

  /**
   * Finds a single user by their ID.
   * @param id The ID of the user to find.
   * @returns The user object or undefined if not found.
   */
  public async findById(id: number): Promise<User | undefined> {
    let connection: oracledb.Connection | undefined;
    try {
      connection = await getConnection();
      const result = await connection.execute<User>(
        `SELECT id, name, email, password_hash as "passwordHash" FROM users WHERE id = :id`,
        [id] // Use bind variables for security
      );
      return result.rows ? result.rows[0] : undefined;
    } catch (err) {
      console.error(`Error in UserRepository.findById(${id}):`, err);
      throw new Error('Failed to fetch user by ID.');
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  /**
   * Finds a single user by their email address.
   * @param email The email of the user to find.
   * @returns The user object or undefined if not found.
   */
  public async findByEmail(email: string): Promise<User | undefined> {
    let connection: oracledb.Connection | undefined;
    try {
      connection = await getConnection();
      const result = await connection.execute<User>(
        `SELECT id, name, email, password_hash as "passwordHash" FROM users WHERE email = :email`,
        [email]
      );
      return result.rows ? result.rows[0] : undefined;
    } catch (err) {
      console.error(`Error in UserRepository.findByEmail(${email}):`, err);
      throw new Error('Failed to fetch user by email.');
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  /**
   * Creates a new user in the database.
   * @param userData The data for the new user.
   * @returns The newly created user object, including their new ID.
   */
  public async create(userData: Omit<User, 'id'>): Promise<User> {
    let connection: oracledb.Connection | undefined;
    try {
      connection = await getConnection();
      const sql = `INSERT INTO users (name, email, password_hash) 
                   VALUES (:name, :email, :passwordHash) 
                   RETURNING id INTO :retId`;

      const bindParams = {
        name: userData.name,
        email: userData.email,
        passwordHash: userData.passwordHash,
        // Special out-bind to get the returned ID from Oracle
        retId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      };

      const result = await connection.execute(sql, bindParams);
      
      // CRITICAL: You must commit write operations
      await connection.commit();

      const newId = (result.outBinds as any).retId[0];
      
      return { id: newId, ...userData };
    } catch (err) {
      console.error('Error in UserRepository.create:', err);
      throw new Error('Failed to create user.');
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * Updates an existing user's data.
   * @param id The ID of the user to update.
   * @param userData The fields to update.
   * @returns The updated user object.
   */
  public async update(id: number, userData: UpdateUserDto): Promise<User | undefined> {
    let connection: oracledb.Connection | undefined;
    try {
        connection = await getConnection();

        // Dynamically build the SET part of the query
        const fieldsToUpdate = Object.keys(userData);
        if (fieldsToUpdate.length === 0) {
            return await this.findById(id); // Nothing to update
        }

        const setClause = fieldsToUpdate.map((key, i) => `${key} = :${i + 1}`).join(', ');
        const values = fieldsToUpdate.map(key => (userData as any)[key]);
        
        const sql = `UPDATE users SET ${setClause} WHERE id = :id`;

        await connection.execute(sql, [...values, id]);
        await connection.commit();

        return await this.findById(id);
    } catch (err) {
        console.error(`Error in UserRepository.update(${id}):`, err);
        throw new Error('Failed to update user.');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
  }

  /**
   * Deletes a user from the database.
   * @param id The ID of the user to delete.
   */
  public async delete(id: number): Promise<void> {
    let connection: oracledb.Connection | undefined;
    try {
        connection = await getConnection();
        await connection.execute(`DELETE FROM users WHERE id = :id`, [id]);
        await connection.commit();
    } catch (err) {
        console.error(`Error in UserRepository.delete(${id}):`, err);
        throw new Error('Failed to delete user.');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
  }
}