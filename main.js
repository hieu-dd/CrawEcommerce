import fetch from "node-fetch"
import pg from "pg";
const { Pool } = pg

const database = "skynet9" ?? process.env.POSTGRES_DB;
const credentials = {
    user: "postgres" ?? process.env.POSTGRES_USER,
    host: "localhost" ?? process.env.POSTGRES_HOST,
    password: "password" ?? process.env.POSTGRES_PASSWORD,
    port: "5432" ?? process.env.POSTGRES_PORT,
};
const dbCredentials = { ...credentials, database: database }
let pool = new Pool(dbCredentials)

async function prepareDb() {
    try {
        await pool.query('SELECT NOW()')
        console.log(`Db ${database} is ready`)
    } catch (e) {
        await createDatabase()
    }
}

async function createDatabase() {
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
    await insertPlatform()
}
async function insertProduct(product) {
    try {
        const res = await pool.query(`INSERT INTO products(id,name,platform_id,shop_id,description,url,brand,price,price_before_discount) VALUES(DEFAULT,'${product.name}',1,null,'description','${product.short_url}',null,${product.price},${product.original_price}) RETURNING id;`)
        console.log("insert success: ", product.name)
        return res.rows[0].id
    } catch (e) {
        console.log("insert err: ", e, product.name)
        return 0
    }
}

async function insertProductImages(product_id, url) {
    try {
        await pool.query(`INSERT INTO product_images(url,product_id) VALUES('${url}',${product_id});`)
        console.log(`Insert product images success`)
    } catch (e) {
        console.log(`Insert product_images err: `, product_id)
    }
}

async function insertAttributes(attr, product_id) {
    try {
        await pool.query(`INSERT INTO attibutes(product_id,name,value) VALUES (${product_id},'${attr.name}','${attr.value}');`)
        console.log(`Insert product_attr success: `, product_id)
    } catch (e) {
        console.log(`Insert product_attr err: `, product_id)
    }
}

async function insertPlatform() {
    try {
        await pool.query(`INSERT INTO platforms(id,"name") VALUES(1,'tiki');`)
        console.log(`Insert platform success`)
    }
    catch (e) {
        console.log(`Insert platform err`)
    }
}

async function craw() {
    await prepareDb()
    const catsJson = await getCategories()
    for (const cat of catsJson.items) {
        let page = 0;
        let catid = cat.id
        if (catid <= 0) {
            continue
        }
        let hasMore = true
        while (hasMore) {
            const listingsResponse = await getListings(catid, page)
            if (!listingsResponse || !listingsResponse.data) {
                continue
            }
            for (const item of listingsResponse.data) {
                await sleep(250);
                const itemDetail = await getDetail(item.id)
                if (itemDetail.errors) {
                    console.log("Fetch err:", itemDetail.errors)
                } else {
                    const id = await insertProduct(itemDetail)
                    if (itemDetail.images && itemDetail.images[0] && itemDetail.images[0].base_url) {
                        await insertProductImages(id, itemDetail.images[0].base_url)
                    }
                    let attributes = itemDetail.specifications.flatMap(e => e.attributes);
                    attributes.forEach(async (attr) => {
                        await insertAttributes(attr, id)
                    });
                }

                hasMore = listingsResponse.data.length > 0
                page++
            }
        }
    }
}
async function getCategories() {
    const response = await fetch("https://tiki.vn/api/personalish/v1/blocks/categories?block_code=featured_categories", {
        method: 'GET',
        headers: {
            'accept': 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
        },
    });
    const jsonResponse = await response.json();
    return jsonResponse
}

async function getListings(catid, page) {
    const response = await fetch(`https://tiki.vn/api/personalish/v1/blocks/listings?limit=100&category=${catid}&page=${page}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
        },
    });
    const jsonResponse = await response.json();
    return jsonResponse
}

async function getDetail(id) {
    const response = await fetch(`https://tiki.vn/api/v2/products/${id}?platform=web`, {
        method: 'GET',
        headers: {
            'accept': 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
        },
    });
    const jsonResponse = await response.json();
    return jsonResponse
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function main() {
    craw()
}

main()
