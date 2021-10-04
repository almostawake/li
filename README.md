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

## Cloud Shell Setup

The steps I went through in order to get the code working on GCP cloud shell

- Open Cloud Shell (I'm using the bankscrape project I'd set up)
- cd into `~/cloudshell_open` and checkout project `git clone https://github.com/almostawake/li.git`
- cd into the created `li` directory and check for this branch `git branch -a`
- switch to this branch `git checkout --track origin/feature/marc` and check `git branch`
- In your home directory (i.e. `cd ~`, or cd `/home/marc` for me. You can find out the home directory by `cd $HOME` and 
  `pwd`). Create/edit the file `.customize_environment`. My file looks as follows:

_TODO: this is not working at the moment!_
```shell
#!/bin/sh
sudo -u $USER echo "### Starting Customise environment ###"

apt-get update

# Libraries required for puppeteer
apt-get install -y libxss1
apt-get install -y libgbm-dev

#apt-get install -y gconf-service \
#  libasound2 \
#  libatk1.0-0 \
#  libatk-bridge2.0-0 \
#  libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget


# Install Node 14 and check
sudo -i su $USER -c '. /usr/local/nvm/nvm.sh && nvm install 14'
sudo -i su $USER -c '. /usr/local/nvm/nvm.sh && nvm use 14 --silent'
sudo -i su $USER -c '. /usr/local/nvm/nvm.sh && nvm alias default node'
sudo su $USER -c 'node --version'
sudo su $USER -c 'npm --version'

# Install Typescript and check
sudo -u $USER npm install -g typescript
sudo -u $USER tsc --version

# Install Firebase and check
sudo -u $USER npm install -g firebase-tools
sudo -u $USER firebase --version

sudo -u $USER echo "### Customise Environment Completed! ###"
```

- You can either restart the cloudshell to initiate the above, or run the commands manually in the 
  shell to check the all work (the firebase stuff is from the bankscrape code). You can check 
  everything worked correctly with `cat /var/log/customize_environment`

## Theia debug setup

The following is the setup for the default cloud shell editor (Theia).

- Todo!
