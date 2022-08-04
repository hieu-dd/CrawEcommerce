
export const database = process.env.POSTGRES_DB;
export const credentials = {
    user: process.env.POSTGRES_USER ?? "postgres",
    host: process.env.POSTGRES_HOST ?? "localhost",
    password: process.env.POSTGRES_PASSWORD ?? "password",
    port: process.env.POSTGRES_PORT ?? "5432",
};
export const dbCredentials = { ...credentials, database: database }