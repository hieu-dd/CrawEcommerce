import fetch from "node-fetch"
import pg from "pg";
import { insertPlatform } from "../db.js";
import { dbCredentials } from '../credentials.js'
import { sleep } from "../util.js";
const { Pool } = pg

let pool = new Pool(dbCredentials)

const base_url = 'https://shopee.vn/'
const base_file_url = 'https://cf.shopee.vn/file/'
const unit = 100000
export async function crawShopee() {
    await insertPlatform(pool, 2, 'shopee')
    const catsJson = await getCategories()
    for (const cat of catsJson.data.categories) {
        let page = 0;
        let catid = cat.category_id
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
                await sleep(1500);
                const data = await getDetail(item.itemid, item.shopid)
                if (data.error || data.error_msg) {
                    console.log("err: ", data)
                } else {
                    const itemDetail = data.data
                    console.log(`cat: ${catid} page: ${page}`)
                    const id = await insertProduct(itemDetail)
                    if (id) {
                        item.images && itemDetail.images.forEach(async (image) => {
                            const url = `${base_file_url}${image}`
                            await insertProductImages(id, url)
                        });
                        itemDetail.attributes && itemDetail.attributes.forEach(async (attr) => {
                            await insertAttributes(attr, id)
                        });
                    }
                }
            }

            hasMore = sections.has_more ?? false
            page++
        }
    }
}

async function getCategories() {
    const response = await fetch(`https://shopee.vn/api/v4/official_shop/get_categories?tab_type=1`, {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        },
    });
    const categoriesJson = await response.json();
    return categoriesJson
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
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
            'Host': 'shopee.vn'
        },
    });
    const productJson = await response.json();
    return productJson
}

async function insertProduct(product) {
    try {
        const url = `${base_url}${product.name}-i.${product.shopid}.${product.itemid}`
        const query = `INSERT INTO products(id,name,platform_id,shop_id,description,url,brand,price,price_before_discount) VALUES(DEFAULT,'${product.name}',2,${product.shopid},'${product.description}','${url}','${product.brand}',${product.price / unit},${product.price_max_before_discount / unit}) RETURNING id;`
        console.log(query)
        const res = await pool.query(query)
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