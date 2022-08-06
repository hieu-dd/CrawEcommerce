import { crawTiki } from "./tiki/index.js";
import { crawShopee } from "./shopee/index.js";
import { crawLazada } from "./lazada/index.js";

async function main() {
    await crawTiki()
    await crawLazada()
    await crawShopee()
}

main()