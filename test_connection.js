
const { Pool, Client } = require('pg')

const credentials = {
  user: process.env.POSTGRES_USER ,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB ,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
};

// Connect with a connection pool.

async function poolDemo() {
  const pool = new Pool(credentials);
  const now = await pool.query("SELECT NOW()");
  await pool.end();

  return now;
}

// Connect with a client.

async function clientDemo() {
  const client = new Client(credentials);
  await client.connect();
  const now = await client.query("SELECT NOW()");
  await client.end();

  return now;
}

(async () => {
  try {
    const poolResult = await poolDemo();
    console.log("Time with pool: " + poolResult.rows[0]["now"]);

    const clientResult = await clientDemo();
    console.log("Time with client: " + clientResult.rows[0]["now"]);
  } catch (e) {
    console.log(e)
  }
})();