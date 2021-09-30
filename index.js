const { Storage } = require('@google-cloud/storage');
const puppeteer = require('puppeteer');
const takeScreenshots = false;


exports.readProfiles = async (req, res) => {
    console.log('started readProfiles');
    const results = {};
    results.cookieUserId = 'dunno yet'; // will hold id of the user whose cookies we're using
    results.profiles = []; // will hold the profile scrapes
    const { page, cookieUserId } = await setup(req.body.cookies);
    results.cookieUserId = cookieUserId;
    for (const profileUserId of req.body.profiles) {
        results.profiles.push(await readProfile(page, profileUserId)); // add scraped profile info to results
    }
    await page.browser().close();
    console.log(results);
    res.status(200).send(JSON.stringify(results));
}

// set up puppeteer using cookies saved with chome plugin "Export cookie JSON file for Puppeteer"
setup = async (cookies) => {

    console.log('setting up puppeteer with supplied cookies');
    const browser = await puppeteer.launch({ args: ['--lang=en-au,en', '--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 2048, height: 1300 });
    await page.setDefaultTimeout(10000);
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36');
    await page.setCookie(...cookies);

    // Navigate to feeds page for the supplied user (from their cookies)
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle2' });

    // Take a screenshot to Google Cloud Storage
    await takeScreenshot(page, '01-onload');

    // Scrape the profile ID for the user whose cookies we have
    const cookieUserURL = await page.$eval('.feed-identity-module a', a => a.getAttribute('href'));
    const cookieUserId = cookieUserURL.split('/')[2];

    return { page, cookieUserId };
}

// read one profile page, return scraped text as an object
readProfile = async (page, profileUserId) => {
    console.log(`reading ${profileUserId}`)
    await page.goto(`https://www.linkedin.com/in/${profileUserId}/`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, `02-${profileUserId}`);
    const profileUserName = await page.$eval('h1.text-heading-xlarge', h1 => h1.textContent);
    const profileTagline = await page.$eval('.text-body-medium.break-words', div => div.innerText);
    const profileConnectionDistance = await page.$eval('.distance-badge .dist-value', span => span.innerText);
    const profileArea = await page.$eval('.text-body-small.inline.t-black--light.break-words', span => span.innerText);
    const connectionLink = await page.$eval('ul.pv-top-card--list.pv-top-card--list-bullet.display-flex.pb1>li.text-body-small > a.ember-view', a => a.href);
    await page.goto(`https://www.linkedin.com/in/${profileUserId}/detail/contact-info`, { waitUntil: 'networkidle2' });
    const contactLinks = await page.$$eval('.pv-contact-info__contact-link', anchors => anchors.map(anchor => [anchor.href]));
    await page.goto(connectionLink, { waitUntil: 'networkidle2' });
    const connectionLinks = await page.$$eval('.entity-result__title-text>.app-aware-link', links => links.map(link => [link.innerText.split("\n")[0], link.href]));
    return { profileUserId, profileUserName, profileTagline, profileConnectionDistance, profileArea, contactLinks, connectionLinks};
}

// if required, take screenshots to Google Cloud Storage bucket "almostawake-screenshots"
takeScreenshot = async (page, filename) => {
    if (!takeScreenshots) return;
    const storage = new Storage();
    const screenshotBinary = await page.screenshot({ encoding: 'binary' });
    const bucket = storage.bucket('almostawake-screenshots');
    const file = bucket.file(`${filename}.png`);
    await file.save(screenshotBinary, { metadata: { contentType: 'image/png' }, });
}