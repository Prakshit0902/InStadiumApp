import './load-env.js';
import { Pool } from 'pg';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Set DATABASE_URL for SQL queries.');
}
const pool = new Pool({ connectionString });
export async function sql(strings, ...values) {
    let text = '';
    for (let i = 0; i < strings.length; i += 1) {
        text += strings[i];
        if (i < values.length) {
            text += `$${i + 1}`;
        }
    }
    const result = await pool.query(text, values);
    return result.rows;
}
export async function closeDbPool() {
    await pool.end();
}
