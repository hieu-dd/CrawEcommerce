import cheerio from 'cheerio';
import request from 'request-promise';

export async function crawLazada(){
    // Demo get title product lazada
    request('https://www.lazada.vn/products/op-lung-dien-thoai-silicon-ma-c77-cho-iphone-samsung-j2prime-j4plus-j6-j6plus-j7prime-j7pro-j8-a7-2018-a10-a20-a30-a50-a70-m20-j5prime-a10s-a20s-a51-a71-oppo-a37-a59-a7-a5s-a1k-f1s-neo9-f5-f7-f9-f11-f11-pro-rmc38-i907000983-s4759298376.html?spm=a2o4n.home.flashSale.5.7d6ae182Q48Uvl&search=1&mp=1&c=fs&clickTrackInfo=rs%3A0.08310294151306152%3Bfs_item_discount_price%3A1000%3Bitem_id%3A907000983%3Bmt%3Ahot%3Bfs_utdid%3A-1%3Bfs_item_sold_cnt%3A52%3Babid%3A287818%3Bfs_item_price%3A25000%3Bpvid%3Aceb983c6-59e2-423a-8bc9-8b60edc6db00%3Bfs_min_price_l30d%3A0%3Bdata_type%3Aflashsale%3Bfs_pvid%3Aceb983c6-59e2-423a-8bc9-8b60edc6db00%3Btime%3A1660019890%3Bfs_biz_type%3Afs%3Bscm%3A1007.17760.287818.%3Bchannel_id%3A0000%3Bfs_item_discount%3A96%25%3Bcampaign_id%3A184701&scm=1007.17760.287818.0', (error, response, html) => {
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