# LinkedIn Scraper

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

## Marc's Notes

These are the steps I've gone through to get to this stage (for future reference)

- Make sure everything works! (I do this locally using IntelliJ so I have all the build tools available to me - I'll 
  get everything working on cloud shell afterwards). _Note: to make the doco easier to read, I'd supply a sample body request (as a side note, 
  valid JSON requires double quotes). I.e._ 

*Sample Request*
```json
{
    "cookies" : [
      // ...Add the contents of the www.linkedin.com.cookies.json file here
    ],
    "profiles" : [
        "marcschregardus",
        "andrew-walker-the-impatient-futurist"
    ]
}
```

*Sample Response*
```json
{
    "cookieUserId": "marcschregardus",
    "profiles": [
        {
            "profileUserId": "marcschregardus",
            "profileUserName": "Marc Schregardus",
            "profileTagline": "Co-Founder at Mondo Ventures",
            "profileConnectionDistance": "1st"
        },
        {
            "profileUserId": "andrew-walker-the-impatient-futurist",
            "profileUserName": "Andrew Walker",
            "profileTagline": "The Impatient Futurist | Head of Projects at ThunderLabs",
            "profileConnectionDistance": "1st"
        }
    ]
}
```

- Create the branch `feature/marc` and work in that - merge back into master if/when you want to!
- Add the `start-functions` script to the `package.json` file. This will allow me to debug your code with IntelliJ and
  step through it to see what's going on. I've created a run profile and checked this in (stored in the `.run` directory)
- Covert to typescript (by following the steps [here](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html))
  - Create `src` directory and move the `index.js` there (try to keep code separate from configuration - this is 
    the standard location)
  - `sudo npm install -g typescript` to globally install typescript (if not installed). You can check beforehand with 
    `tsc -v` as `tsc` is the typescript compiler (the `-g` flag is a global install)
  - `npm install typescript express @types/express --save` - add typescript as a dependency
  - `tsc --init` to create the `tsconfig.json` file. Change the following in this file
    - `"target": "es6",` - change to ES6 for additional typescript language features
    - `"rootDir": "src",` - specify the `src` directory as the root for all your files
    - `"outDir": "dist/src",` - everything gets compiled to the `dist` directory, then keep the same structure
    - `"sourceMap": true,` - uncomment so we can debug in IntellJ (note - I haven't setup hotloading yet)
  - Rename the file `index.js` to `index.ts`
    - Add the correct types, imports etc. I've purposely not refactored here - but happy to help you refactor when you 
      get to that stage
    - Check everything runs using the `tsc` command from the root. See the output javascript in the `dist/src` directory
    - Add `"build": "rm -rf dist && tsc",` to the `package.json` file to cleanly do the above automatically.
    - Add `npm run build && ` to the `start-functions` to always build before deploying
    - Add `--source=dist/src` to the `functions-framework` command to specify where the source is located
  - Add [prettier](https://www.npmjs.com/package/prettier) - ensures code is always formatted nicely/correctly
    - `npm install prettier --save-dev`
    - `"format": "prettier --write \"./src/**/*.ts{,?}\""`
    - `npm run format` - fixes up format problems (double quotes instead of single, spacing etc)
