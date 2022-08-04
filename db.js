import { database, credentials, dbCredentials } from './credentials.js'
import pg from "pg";
const { Pool } = pg

const pool = new Pool(dbCredentials)

export async function prepareDb() {
    if(!database){
        console.log("Must have env database")
        return
    }
    try {
        await pool.query('SELECT NOW()')
        console.log(`Db ${database} is ready`)
    } catch (e) {
        await createDatabase()
    }
}

export async function createDatabase() {
    let dbPool = new Pool(credentials)
    await dbPool.query(`CREATE DATABASE ${database}`)
    console.log(`Create dc ${database} success`)
    dbPool.end()
    await pool.query(`CREATE TABLE platforms (
        id SERIAL,
        name text,
        created_at timestamp NOT NULL default now(),
        updated_at timestamp NOT NULL default now(),
        deleted_at timestamp,
      
        CONSTRAINT platforms__pk PRIMARY KEY (id)
      )`)
    await pool.query(`CREATE TABLE products (
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
    await pool.query(`CREATE TABLE attibutes (
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
    await pool.query(`CREATE TABLE product_images (
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
    pool.end()
}