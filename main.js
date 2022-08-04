import { crawTiki } from "./tiki/index.js";
import { crawShopee } from "./shopee/index.js";
import { crawLazada } from "./lazada/index.js";
switch (process.env.PLATFORM) {
    case 'tiki':
        crawTiki()
        break;
    case 'shopee':
        crawShopee()
        break;
    case 'lazada':
        crawLazada()
        break;
    case 'all':
        crawTiki()
        crawShopee()
        crawLazada()
        break;
    default:
        console.log("Env PLATFORM must be tiki, shoppe or lazada")
}