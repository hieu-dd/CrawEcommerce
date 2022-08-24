import cheerio from 'cheerio';
import fs from 'fs-extra'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { updateString } from '../util.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export function getCategories() {
    const categories = []
    const html = fs.readFileSync(__dirname + "/categories.html")

    const $ = cheerio.load(html)
    $('.oUjVe').each((_, col) => {
        const $col = cheerio.load(col)
        let parentId
        let parentName
        $col('a').each((i, a) => {
            const name = updateString($col(a).text())
            const hrefs = $col(a).attr('href').split('.')
            const id = hrefs[hrefs.length - 1]
            if (i) {
                categories.push({
                    name,
                    id,
                    parentId,
                    parentName,
                    baseId: 0
                })
            } else {
                parentId = id
                parentName = name
            }
        })
    })

    fs.writeFile("categories.json",JSON.stringify(categories))
    return categories
}

getCategories()