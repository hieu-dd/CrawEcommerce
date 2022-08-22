import cheerio from 'cheerio';
import fs from 'fs-extra'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function getCategories() {

    fs.readFile(__dirname + "/categories.html", function (error, html) {
        if (error) {
            throw error;
        }
        const categories = []
        const $ = cheerio.load(html)
        $('.iBByno').each((index, col) => {
            const category = {
                children: []
            }
            const $col = cheerio.load(col)
            $col('a').each((i, a) => {
                const name = updateString($col(a).text())
                const id = $col(a).attr('href')
                if (i) {
                    category.children.push({
                        name: name,
                        id: id
                    })
                } else {
                    category.name = name
                    category.id = id
                }
            })
            categories.push(category)

        })
        console.log(categories[0])
    });


}

function updateString(s) {
    return s.replace('\n', ' ').split(" ").filter(x=>x).join(' ')
}

getCategories()