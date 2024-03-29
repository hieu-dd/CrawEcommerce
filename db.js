import { database, credentials, dbCredentials } from './credentials.js'
import pg from "pg";
import { BASE_CATEGORIES } from './base_categories.js';
const { Pool } = pg


let pool = new Pool(credentials)
const databasePool = new Pool(dbCredentials)

export async function prepareDb() {
  if (!database) {
    throw ("Must have env database")
  }

  try {
    await pool.query('SELECT NOW()')
  } catch (e) {
    pool.end()
    throw ("Cannot connect Postgres database")
  }

  try {
    await databasePool.query('SELECT NOW()')
    console.log(`Db ${database} is ready`)
    const checkTables = await databasePool.query(`SELECT EXISTS (
      SELECT FROM 
          pg_tables
      WHERE 
          schemaname = 'public' AND 
          tablename  = 'partner_products'
      );`)
    console.log(checkTables)
    if (!checkTables || !checkTables.rows || !checkTables.rows[0] || !checkTables.rows[0].exists) {
      await createTables()
    }
  } catch (e) {
    console.log(e)
    await createDatabase()
  }
}

export async function createDatabase() {
  try {
    await pool.query(`CREATE DATABASE ${database}`)
    console.log(`Create dc ${database} success`)
    pool.end()
    await createTables()
  } catch {
    throw (`Cannot create database ${database}`)
  }
}

async function createTables() {
  try {
    await databasePool.query(`CREATE TABLE platforms (
      id SERIAL,
      name text,
      created_at timestamp NOT NULL default now(),
      updated_at timestamp NOT NULL default now(),
      deleted_at timestamp,
    
      CONSTRAINT platforms__pk PRIMARY KEY (id)
    )`)
    await databasePool.query(`CREATE TABLE "categories" (
      "id" SERIAL PRIMARY KEY,
      "name" text,
      "parentid" int,
      "created_at" timestamp NOT NULL DEFAULT (now()),
      "updated_at" timestamp NOT NULL DEFAULT (now()),
      "deleted_at" timestamp
    );`)

    await databasePool.query(`CREATE TABLE "partner_products" (
      "id" SERIAL PRIMARY KEY,
      "name" text,
      "platform_id" integer,
      "category_id" integer,
      "categories" text[],
      "sku" text,
      "shop_id" text,
      "description" text,
      "url" text,
      "brand" text,
      "price" float,
      "price_before_discount" float,
      "created_at" timestamp NOT NULL DEFAULT (now()),
      "updated_at" timestamp NOT NULL DEFAULT (now()),
      "deleted_at" timestamp
    );`)
    await databasePool.query(`CREATE TABLE attibutes (
      id SERIAL,
      product_id integer,
      name text,
      value text,
      created_at timestamp NOT NULL default now(),
      updated_at timestamp NOT NULL default now(),
      deleted_at timestamp,
    
      CONSTRAINT attibutes__pk PRIMARY KEY (id),
      CONSTRAINT attibutes_product_id__fk FOREIGN KEY (product_id) REFERENCES partner_products(id)
    )`)
    await databasePool.query(`CREATE TABLE product_images (
      id SERIAL,
      url text,
      product_id integer,
      created_at timestamp NOT NULL default now(),
      updated_at timestamp NOT NULL default now(),
      deleted_at timestamp,
    
      CONSTRAINT product_images__pk PRIMARY KEY (id),
      CONSTRAINT product_images_product_id__fk FOREIGN KEY (product_id) REFERENCES partner_products(id)
    )`)

    for (const catid in BASE_CATEGORIES) {
      const name = BASE_CATEGORIES[catid]
      let query = `INSERT INTO categories(id,name) VALUES($1,$2) RETURNING id;`
      let values = [catid, name];
      await databasePool.query(query, values)
    }


    console.log(`Create tables success`)


    databasePool.end()
  } catch (e) {
    databasePool.end()
    throw (`Cannot create tables`)
  }
}

export async function insertPlatform(pool, id, name) {
  try {
    await pool.query(`INSERT INTO platforms(id,"name") VALUES(${id},'${name}');`)
    console.log(`Insert platform success`)
  }
  catch (e) {
    console.log(`Insert platform ${name} err`)
  }
}

export async function checkProductExits(pool, sku, platform_id) {
  try {
    const res = await pool.query(`select exists(select 1 from partner_products where sku='${sku}' and platform_id=${platform_id})`)
    return res && res.rows && res.rows[0] && res.rows[0].exists ? res.rows[0].exists : false
  } catch (e) {
    return false
  }
}