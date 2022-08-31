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
//     $('.lzd-site-menu-sub-item').each((_, col) => {
//         const $col = cheerio.load(col)
//         let parentId
//         let parentName
//         const a = $col('a').first()

//         const name = updateString($col(a).text())
//         const href = $col(a).attr('href')
//         const hrefs =href && $col(a).attr('href').split('/')
//         const id = hrefs && hrefs[hrefs.length - 1] || hrefs[hrefs.length - 2]
//         if (id) {
//             categories.push({
//                 name,
//                 id,
//                 parentId,
//                 parentName,
//                 href,
//                 baseId: 0
//             })
//         }
//     })

//     fs.writeFile("categories.json", JSON.stringify(categories))
//     return categories
// }

export function getCategories() {
    const data = fs.readFileSync(__dirname + "/categories.json")
    const categories = JSON.parse(data)
    return categories
}

console.log(getCategories())