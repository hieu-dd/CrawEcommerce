import { crawTiki } from "./tiki/index.js";
import { crawShopee } from "./shopee/index.js";
import { crawLazada } from "./lazada/index.js";
import { prepareDb } from "./db.js";
const platform = process.env.PLATFORM ?? 'all'
async function main() {
    await prepareDb()
    switch (platform) {
        case 'all':
            await crawTiki()
            await crawLazada()
            await crawShopee()
            break;
        case 'tiki':
            await crawTiki()
            break;
        case 'shopee':
            await crawShopee()
            break;
        case 'lazada':
            await crawLazada()
            break;
    }
}

main()