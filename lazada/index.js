import cheerio from 'cheerio';
import request from 'request-promise';

export async function crawLazada() {
  await parseProductDetail('https://www.lazada.vn/products/ao-thun-nam-nu-unisex-form-rong-in-hinh-wipoos-doc-dep-vai-day-min-thiet-ke-thoi-trang-duong-may-sac-sao-i1479994665-s6164173599.html')
}


async function parseProductDetail(url) {
    request(url, (error, response, html) => {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html); // load HTML
            let title = $('.pdp-product-title').find('h1').text()
            console.log(title)
        }
        else {
            console.log(error);
        }
    });
}

crawLazada()