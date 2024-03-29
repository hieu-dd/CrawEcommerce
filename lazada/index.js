
import { getCategories } from './categories.js';
import { insertPlatform, checkProductExits } from '../db.js';
import { startBrowser } from '../browser/browser.js';
import fetch from "node-fetch"
import pg from "pg";
import { dbCredentials } from '../credentials.js'

const { Pool } = pg

let pool = new Pool(dbCredentials)

export async function crawLazada() {
    console.log("Craw lazada start")
    let crawedCount = 0
    let existCount = 0
    await insertPlatform(pool, 3, 'lazada')
    const categories = getCategories()
    for (const cat of categories) {
        if (cat.baseId != 100019) { // TODO : remove
            continue
        }
        let page = 1;
        let hasMore = true
        while (hasMore) {
            const listingsResponse = await getListings(cat, page)
            if (!listingsResponse || !listingsResponse.mods || !listingsResponse.mods.listItems) {
                hasMore = false
                continue
            }
            for (const item of listingsResponse.mods.listItems) {
                try {
                    console.log(`crawed : ${crawedCount} ---- exists: ${existCount}`)
                    const exists = await checkProductExits(pool, item.itemId, 3)
                    if (exists) {
                        existCount++
                        console.log(`${item.itemId} exist`)
                        continue
                    }
                    let description
                    if (item.description && item.description.length) {
                        description = item.description.join(', ')
                    } else {
                        description = await crawDetail(`https:${item.itemUrl}`)
                    }
                    console.log(description)
                    const id = await insertProduct(item, cat.baseId, description ?? "")
                    crawedCount++
                    if (id) {
                        const images = [...item.thumbs.map(e => e.image), item.image]
                        images.forEach(async (img) => {
                            console.log(4)
                            await insertProductImages(id, img)
                        });
                    }
                } catch (e) {
                    console.log(e)
                }
            }
            hasMore = listingsResponse.mods.listItems.length > 0
            page++
        }
    }
}

async function insertProduct(product, category_id, description) {
    console.log((category_id))
    let query = `INSERT INTO partner_products(name,platform_id,category_id,sku,shop_id,description,url,brand,price,price_before_discount) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`
    let values = [product.name, 3, category_id, product.itemId, null, description, `https:${product.itemUrl}`, product.brandName, product.price, product.originalPrice ?? product.price];
    try {
        const res = await pool.query(query, values)
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

async function getListings(cat, page) {
    try {
        const response = await fetch(`https://${cat.url}/?ajax=true&page=${page}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
            },
        });
        const jsonResponse = await response.json();
        return jsonResponse
    } catch (e) {
        return null
    }
}

async function crawDetail(url) {
    console.log(`Navigating to ${url}`);
    let crawCount = 0
    let description = null
    while (crawCount < 3 && !description) {
        const browser = await startBrowser();
        try {
            let page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() === 'image' || req.url().includes('png') || req.url().includes('jpg')) {
                    req.abort();
                }
                else {
                    req.continue();
                }
            });
            crawCount++
            await page.goto(url);
            await page.waitForSelector('.pdp-product-desc');
            description = await page.$eval('.pdp-product-desc', text => text.textContent)
        } catch (e) {
            if (crawCount == 3) {
                console.log(e)
            }
        } finally {
            await browser.close()
        }
    }

    return description
}

crawLazada()