import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  let connection;

  try {
    console.log('Connecting to MySQL database...');
    connection = await pool.getConnection();

    console.log('Reading schema file...');
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log('Executing schema statements...');
    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log('Database initialized successfully!');

    const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
    if (categories[0].count === 0) {
      console.log('Adding sample categories...');
      await connection.query(
        'INSERT INTO categories (name) VALUES (?), (?), (?), (?), (?)',
        ['Food & Dining', 'Fitness & Sports', 'Nature & Parks', 'Shopping', 'Entertainment']
      );
      console.log('Sample categories added.');
    }

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

initializeDatabase();
