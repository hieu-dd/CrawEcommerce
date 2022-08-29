import fetch from "node-fetch";
import pg from "pg";
import { insertPlatform } from "../db.js";
import { dbCredentials } from '../credentials.js'
import { sleep } from "../util.js";
import fs from 'fs-extra'
import { getCategories } from "./categories.js";
const { Pool } = pg

let pool = new Pool(dbCredentials)

const base_url = 'https://shopee.vn/'
const base_file_url = 'https://cf.shopee.vn/file/'
const unit = 100000
const LIMIT_ERR = 90309999
export async function crawShopee() {
    console.log("Craw shopee start")
    let crawedCount = 0
    let crawedErr = 0
    let times = []
    let errTime = {}

    await insertPlatform(pool, 2, 'shopee')
    const categories = await getCategories()
    for (const cat of categories) {
        let page = 0;
        let catid = cat.id
        if (catid <= 0) {
            continue
        }
        let hasMore = true
        while (hasMore) {
            const recommendJson = await getRecommened(catid, page * 100)
            if (!recommendJson || !recommendJson.data || !recommendJson.data.sections || !recommendJson.data.sections[0]) {
                continue
            }
            const sections = recommendJson.data.sections[0]
            if (!sections.data.item) {
                continue
            }
            for (const item of sections.data.item) {
                let failedTime = 0
                while (failedTime < 5) {
                    await sleep(2000);
                    const data = await getDetail(item.itemid, item.shopid)
                    if (data.error && data.error == LIMIT_ERR) {
                        crawedErr++
                        if (!errTime.start) {
                            errTime.start = new Date().getTime()
                        }
                        console.log("Err limit: ", data)
                        await sleep(60000 * (failedTime ? 2 : 8))
                        failedTime++
                    } else if (data.error) {
                        failedTime++
                        console.log("Err: ", data)
                        continue
                    }
                    else {
                        if (errTime.start) {
                            errTime.end = new Date().getTime()
                            times.push(errTime)
                            errTime = {}
                        }
                        const itemDetail = data.data
                        crawedCount++
                        console.log("Shopee crawed: ", crawedCount, "catid: ", catid, "page:", page)
                        const id = await insertProduct(itemDetail, cat.baseId)
                        if (id) {
                            item.images && itemDetail.images.forEach(async (image) => {
                                const url = `${base_file_url}${image}`
                                await insertProductImages(id, url)
                            });
                            itemDetail.attributes && itemDetail.attributes.forEach(async (attr) => {
                                await insertAttributes(attr, id)
                            });
                        }
                        break
                    }
                }
            }

            hasMore = sections.has_more ?? false
            page++
        }
    }
    fs.writeFileSync('errTimes.json', times)
}

async function getRecommened(catid, offset) {
    const response = await fetch(`https://shopee.vn/api/v4/recommend/recommend?bundle=mall_popular&catid=${catid}&item_card=2&limit=100&offset=${offset}`, {
        method: 'GET',
    });
    const recommendJson = await response.json();
    return recommendJson
}

async function getDetail(id, shopId) {
    const url = `https://shopee.vn/api/v4/item/get?&itemid=${id}&shopid=${shopId}`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'User-Agent': 'xx',
            'Host': 'shopee.vn'
        },
    });
    const productJson = await response.json();
    return productJson
}

async function insertProduct(product, baseId) {
    try {
        const url = `${base_url}${product.name}-i.${product.shopid}.${product.itemid}`
        let query = `INSERT INTO partner_products(name,platform_id,category_id,sku,shop_id,description,url,brand,price,price_before_discount) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`
        let values = [product.name, 2, baseId, product.itemid, product.shopid, product.description, url, product.brand, product.price / unit, product.price_max_before_discount / unit];
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
