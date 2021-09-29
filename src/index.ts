import { Request, Response } from "express";
import { Storage } from "@google-cloud/storage";
import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import { Protocol } from "devtools-protocol";

const takeScreenshots = false; // TODO pass as a parameter in the body of the request

// TODO - you can either do this, or provide a const function and reference at the bottom of the page (the convention)
export const readProfiles = async (req: Request, res: Response) => {
  console.log("started readProfiles");
  const results: any = {}; // TODO create a TS interface rather than use any
  results.cookieUserId = "dunno yet"; // will hold id of the user whose cookies we're using - TODO leave as undefined
  results.profiles = []; // will hold the profile scrapes
  const { page, cookieUserId } = await setup(req.body.cookies);
  results.cookieUserId = cookieUserId;

  // TODO use Promise.all to read the profiles synchronously
  for (const profileUserId of req.body.profiles) {
    results.profiles.push(await readProfile(page, profileUserId)); // add scraped profile info to results
  }
  await page.browser().close(); // TODO put in a finally block
  console.log(results);
  res.status(200).json(results); // TODO send back as JSON rather than a string
  // TODO wrap everything in a try/catch to handle errors gracefully (and output with correct code) - at the moment the whole app crashes if there's a problem
};

// set up puppeteer using cookies saved with chome plugin "Export cookie JSON file for Puppeteer"
// TODO your functions need "const" in front of them. Nice to define the return type (i.e. Promise<YourObject>)
const setup = async (cookies: Protocol.Network.CookieParam[]) => {
  console.log("setting up puppeteer with supplied cookies");
  const browser = await puppeteer.launch({
    args: ["--lang=en-au,en", "--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 2048, height: 1300 });
  await page.setDefaultTimeout(10000);
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
  );
  await page.setCookie(...cookies);

  // Navigate to feeds page for the supplied user (from their cookies)
  await page.goto("https://www.linkedin.com/feed/", {
    waitUntil: "networkidle2",
  });

  // Take a screenshot to Google Cloud Storage
  await takeScreenshot(page, "01-onload");

  // Scrape the profile ID for the user whose cookies we have
  const cookieUserURL = await page.$eval(".feed-identity-module a", (a) =>
    a.getAttribute("href")
  );
  const cookieUserId = cookieUserURL?.split("/")[2]; // TODO this can be null (hence ?) - so need to check and cater for problems

  return { page, cookieUserId };
};

// read one profile page, return scraped text as an object
const readProfile = async (page: Page, profileUserId: string) => {
  console.log(`reading ${profileUserId}`);
  await page.goto(`https://www.linkedin.com/in/${profileUserId}/`, {
    waitUntil: "networkidle2",
  });
  await takeScreenshot(page, `02-${profileUserId}`);
  const profileUserName = await page.$eval(
    "h1.text-heading-xlarge",
    (h1) => h1.textContent
  );
  const profileTagline = await page.$eval(
    ".text-body-medium.break-words",
    (div) => (div as any).innerText // TODO innerText is not supported - this is a hack to get ts to compile
  );
  const profileConnectionDistance = await page.$eval(
    ".distance-badge .dist-value",
    (span) => (span as any).innerText // TODO innerText is not supported - this is a hack to get ts to compile
  );
  return {
    profileUserId,
    profileUserName,
    profileTagline,
    profileConnectionDistance,
  };
};

// if required, take screenshots to Google Cloud Storage bucket "almostawake-screenshots"
const takeScreenshot = async (page: Page, filename: string) => {
  if (!takeScreenshots) return;
  const storage = new Storage();
  const screenshotBinary = await page.screenshot({ encoding: "binary" });
  const bucket = storage.bucket("almostawake-screenshots");
  const file = bucket.file(`${filename}.png`);
  // TODO - screenshotBinary can be null, so cater for this (! is a hack)
  await file.save(screenshotBinary!, {
    metadata: { contentType: "image/png" },
  });
};
