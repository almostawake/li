const puppeteer = require('puppeteer');

exports.runJob_LOCAL = async () => {

    const username = process.argv[1];
    const password = process.argv[2];
    const job = JSON.parse(process.argv[3]);

    await runJob(username, password, job);

}

runJob = async (username, password, job) => {

    // Set up browser and page
    const browser = await puppeteer.launch({
        args: ['--lang=en-au,en', '--no-sandbox'],
        ignoreDefaultArgs: ['--disable-extensions']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 2048, height: 1300 });
    await page.setDefaultTimeout(10000);

    // Navigate to the login page
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle0' });

    // Login
    await page.type('#username', username);
    await page.type('#password', password);

    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('#btnLogon_field')
    ]);

    // Should be logged in, throw an error if we're not
    console.log('checking login worked');
    const [logOffCheck] = await page.$x('//span[text()="Log off"]');
    //  if (!logOffCheck) screenshotAndThrowError(page, 'not-logged-in', 'something went wrong with login');
    if (!logOffCheck) throw new Error('not logged in for some reason');


    // Scrape selected accounts, synchronously for now (could be done in multiple tabs/pages?)
    console.log(`\nAccount list to scrape: [${accounts}]`);
    const accountTransactionScrapesArray = [];
    for (const account of accounts) {
        const payload = await scrapeAccount(account, page);
        accountTransactionScrapesArray.push(payload);
    }

    // Log out
    console.log('\nLogging out');
    await page.goto('https://www.commbank.com.au/retail/netbank/home/', { waitUntil: 'networkidle0' });
    const [logOffHandle] = (await page.$x('//span[text()="Log off"]'));
    await logOffHandle.click();
    await page.waitFor(1000);
    await browser.close();

    console.info('Logged out, exiting scrapeAll')
    return accountTransactionScrapesArray;

}

exports.runJob_HTTP = (req, res) => {
    runJob (req.params)
}

exports.readProfile_HTTP = (req, res) => {
    res.status(200).send("ok");
}

readProfile = (page, profileId) => {
    console.log(profileId);
}