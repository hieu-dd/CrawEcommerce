import puppeteer from 'puppeteer'

export async function startBrowser() {
    let browser;
    try {
        console.log("Opening the browser......");
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', "--disable-setuid-sandbox"],
            'ignoreHTTPSErrors': true,
            ignoreDefaultArgs: ['--disable-extensions'],
        });
    } catch (err) {
        console.log("Could not create a browser instance => : ", err);
    }
    return browser;
}
