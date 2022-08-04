import { crawTiki } from "./tiki/index.js";

if (process.env.PLATFORM == 'tiki') {
    crawTiki()
} else {
    console.log("Env PLATFORM must be tiki, shoppe or lazada")
}