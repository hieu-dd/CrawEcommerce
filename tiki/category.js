import cheerio from 'cheerio';
import fs from 'fs-extra'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { updateString } from '../util.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// export function getCategories() {
//     const categories = []
//     const html = fs.readFileSync(__dirname + "/categories.html")

//     const $ = cheerio.load(html)
//     $('.iBByno').each((index, col) => {
//         const $col = cheerio.load(col)
//         let parentId
//         let parentName
//         $col('a').each((i, a) => {
//             const name = updateString($col(a).text())
//             const hrefs = $col(a).attr('href').split('/')
//             const id = hrefs[hrefs.length - 1].replace('c', '')
//             if (i) {
//                 categories.push({
//                     name,
//                     id,
//                     parentId,
//                     parentName,
//                 })
//             } else {
//                 parentId = id
//                 parentName = name
//             }
//         })
//     })
//     return categories
// }

export function getCategories() {
    const data = fs.readFileSync(__dirname + "/categories.json")
    const categories = JSON.parse(data)
    return categories
}
