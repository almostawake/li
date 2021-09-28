# Save me from  cutting/pasting from LinkedIn pages to everything else.
**NOTE:** Using this code likely breaks the end user agreement for LinkedIn.


**NOTE:** If you want to keep the screenshot thing working, create a bucket in your project and change the bucket name in your code to match.

Then:

 1. use [Export cookie JSON file for Puppeteer](https://chrome.google.com/webstore/detail/%E3%82%AF%E3%83%83%E3%82%AD%E3%83%BCjson%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E5%87%BA%E5%8A%9B-for-puppet/nmckokihipjgplolmcmjakknndddifde?hl=en) to save your LinkedIn cookies from a valid session.
 1. Clone this repo to your Google Cloud Shell
 1. `npm install`
 1. `npx functions-framework --target=readProfiles`-> this will run up the function in emulation mode
 1. top-right in Cloud Shell "Web Preview" on 8080 -> this will cause the function to crash first time, you need to rerun `npx ...` once
 1. POST to your API from JaSON, Postman or similar with JSON content type and a body containing "cookies" set to the JSON from your saved cookies and "profiles" as an array of strings containing the profile IDs you want to scrape e.g. for profiles: `['james-hartright-098098', 'jane-ayre-09809']`

 You should get back an array of objects with scraped profile information.

