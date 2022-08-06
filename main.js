import { crawTiki } from "./tiki/index.js";
import { crawShopee } from "./shopee/index.js";
import { crawLazada } from "./lazada/index.js";
import { prepareDb } from "./db.js";
async function main() {
    await prepareDb()
    await crawTiki()
    await crawLazada()
    await crawShopee()
}

main()