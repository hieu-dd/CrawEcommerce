import fetch from "node-fetch"
import pg from "pg";
import { insertPlatform } from "../db.js";
import { dbCredentials } from '../credentials.js'
import { sleep } from "../util.js";
const { Pool } = pg

let pool = new Pool(dbCredentials)

async function insertProduct(product) {
    try {
        const res = await pool.query(`INSERT INTO products(id,name,platform_id,shop_id,description,url,brand,price,price_before_discount) VALUES(DEFAULT,'${product.name}',1,null,'${product.description}','${product.short_url}',null,${product.price},${product.original_price}) RETURNING id;`)
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

export async function crawTiki() {
    await insertPlatform(pool, 1, 'tiki')
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
                    console.log(`cat: ${catid} page: ${page}`)
                    const id = await insertProduct(itemDetail)
                    if (id) {
                        if (itemDetail.images && itemDetail.images[0] && itemDetail.images[0].base_url) {
                            await insertProductImages(id, itemDetail.images[0].base_url)
                        }
                        let attributes = itemDetail.specifications.flatMap(e => e.attributes);
                        attributes.forEach(async (attr) => {
                            await insertAttributes(attr, id)
                        });
                    }
                }
            }
            hasMore = listingsResponse.data.length > 0
            page++
        }
    }
    pool.end()
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