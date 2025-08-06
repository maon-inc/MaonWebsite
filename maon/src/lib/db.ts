import { neon } from '@neondatabase/serverless';

function getDbConnection() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set, database features will not work');
    return null;
  }
  return neon(process.env.DATABASE_URL);
}

export async function createEmailsTable() {
  try {
    const sql = getDbConnection();
    if (!sql) {
      console.warn('Database connection not available');
      return;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Emails table created or already exists');
  } catch (error) {
    console.error('Error creating emails table:', error);
  }
}

export async function insertEmail(email: string) {
  try {
    const sql = getDbConnection();
    if (!sql) {
      return { success: false, error: 'Database connection not available' };
    }
    const result = await sql`
      INSERT INTO emails (email) 
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;
    return { success: true, id: result[0]?.id };
  } catch (error) {
    console.error('Error inserting email:', error);
    return { success: false, error: 'Failed to save email' };
  }
}

export async function getEmails() {
  try {
    const sql = getDbConnection();
    if (!sql) {
      console.warn('Database connection not available');
      return [];
    }
    const result = await sql`
      SELECT email, created_at 
      FROM emails 
      ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
} 