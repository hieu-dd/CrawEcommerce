import { database, credentials, dbCredentials } from './credentials.js'
import pg from "pg";
const { Pool } = pg


let pool = new Pool(credentials)
const databasePool = new Pool(dbCredentials)

export async function prepareDb() {
  if (!database) {
    console.log("Must have env database")
    return
  }

  try {
    await pool.query('SELECT NOW()')
  } catch (e) {
    console.log("Cannot connect Postgres database")
    return
  } finally {
    pool.end()
  }

  try {
    await databasePool.query('SELECT NOW()')
    console.log(`Db ${database} is ready`)
  } catch (e) {
    await createDatabase()
  }
}

export async function createDatabase() {
  await pool.query(`CREATE DATABASE ${database}`)
  console.log(`Create dc ${database} success`)
  pool.end()
  await databasePool.query(`CREATE TABLE platforms (
        id SERIAL,
        name text,
        created_at timestamp NOT NULL default now(),
        updated_at timestamp NOT NULL default now(),
        deleted_at timestamp,
      
        CONSTRAINT platforms__pk PRIMARY KEY (id)
      )`)
  await databasePool.query(`CREATE TABLE products (
        id SERIAL,
        name text,
        platform_id integer,
        shop_id text,
        description text,
        url text,
        brand text,
        price float,
        price_before_discount float,
        created_at timestamp NOT NULL default now(),
        updated_at timestamp NOT NULL default now(),
        deleted_at timestamp,
      
        CONSTRAINT products__pk PRIMARY KEY (id),
        CONSTRAINT products_platform_id__fk FOREIGN KEY (platform_id) REFERENCES platforms(id)
      )`)
  await databasePool.query(`CREATE TABLE attibutes (
        id SERIAL,
        product_id integer,
        name text,
        value text,
        created_at timestamp NOT NULL default now(),
        updated_at timestamp NOT NULL default now(),
        deleted_at timestamp,
      
        CONSTRAINT attibutes__pk PRIMARY KEY (id),
        CONSTRAINT attibutes_product_id__fk FOREIGN KEY (product_id) REFERENCES products(id)
      )`)
  await databasePool.query(`CREATE TABLE product_images (
        id SERIAL,
        url text,
        product_id integer,
        created_at timestamp NOT NULL default now(),
        updated_at timestamp NOT NULL default now(),
        deleted_at timestamp,
      
        CONSTRAINT product_images__pk PRIMARY KEY (id),
        CONSTRAINT product_images_product_id__fk FOREIGN KEY (product_id) REFERENCES products(id)
      )`)
  console.log(`Create tables success`)
  databasePool.end()
}