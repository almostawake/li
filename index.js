const { Storage } = require('@google-cloud/storage');
const puppeteer = require('puppeteer');


exports.readProfiles = async (req, res) => {
    console.log('started readProfiles');
    const page = await setup(req.body.cookies);
    //todo loop through each profile in "profiles", scrape something
    //todo clean up browser.close()
    //todo return an array of scraped profiles
    for (const profile of req.body.profiles) {
        console.log(`reading ${profile}`)
        await readProfile(page, profile);
    }
    res.status(200).send('ok');
}

setup = async (cookies) => {

    // Initialise browser, page
    const browser = await puppeteer.launch({ args: ['--lang=en-au,en', '--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 2048, height: 1300 });
    await page.setDefaultTimeout(10000);
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36');
    await page.setCookie(...cookies);

    // Navigate to the login page
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle2' });

    // Take a screenshot to Google Cloud Storage
    await takeScreenshot(page, '01-onload');

    return page;
}

readProfile = async (page, profile) => {
    await page.goto(`https://www.linkedin.com/in/${profile}/`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, `02-${profile}`);
}

takeScreenshot = async (page, filename) => {
    const storage = new Storage();
    const screenshotBinary = await page.screenshot({ encoding: 'binary' });
    const bucket = storage.bucket('almostawake-screenshots');
    const file = bucket.file(`${filename}.png`);
    await file.save(screenshotBinary, { metadata: { contentType: 'image/png' }, });
}