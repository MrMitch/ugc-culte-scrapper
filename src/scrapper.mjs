import crypto from "crypto";
import moment, { momentFromTimestamp } from "./moment";
import puppeteer from "puppeteer";
import urls from "./urls";
import Sentry from '@sentry/node';

const md5 = data => crypto.createHash('md5').update(data).digest("hex");

async function scrape(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const response = await page.goto(url);

    if (!response.ok()) {
        throw new Error("Unable to start scrapping, you might have been rate-limited");
    }

    // remove ad overlay that messes-up with the `click` method
    await page.evaluate(() => { window.top && window.top.closeAdLayer && window.top.closeAdLayer()});

    await page.waitFor(500);

    // remove RGPD overlay that might also mess-up with the `click` method
    await page.evaluate(() => { document.querySelector('.rgpd-custom').remove(); });

    await page.waitFor(500);

    const culteAnchorId = await page.$$eval("#event .module-status-filter .status-filter-list li a", anchors => {
        const anchor = anchors.find(a => a.innerText.toUpperCase().trim() === "UGC CULTE");

        if (!anchor) {
            return null;
        }

        return anchor.id;
    });

    if (culteAnchorId === null) {
        throw new Error("Unable to get culte anchor id");
    }

    // click on the list to show the "Culte" sreenings
    await page.click(`#${culteAnchorId}`);
    await page.waitFor(1000);

    const screenings = await page.$$eval('#event .push-event', screeningsContainer => {
        return screeningsContainer.map(screeningContainer => {
            // this is executed in the context of the page
            const pictureContainer = screeningContainer.querySelector(".picture img");
            const descriptionContainer = screeningContainer.querySelector(".description");
            const titleContainer = descriptionContainer.querySelector(".title");
            const screeningAnchor = descriptionContainer.querySelector("a");
            const typeContainer = descriptionContainer.querySelector(".period .type");
            const dateContainer = screeningContainer.querySelector('.date');

            // no need to import URL, it exists in the context of the page
            const url = new URL(screeningAnchor.href);

            const screeningId = url.searchParams.get("seanceId");
            const title = titleContainer.innerText.trim();
            const cover = pictureContainer.src;
            const date = screeningAnchor.innerText.trim();
            const type = typeContainer.innerText.toUpperCase().trim();

            const shortDateParts = dateContainer.innerText.trim().match(/(?<day>\d+)\s+(?<month>\d+)/);
            let month = null;
            if (shortDateParts.groups && shortDateParts.groups.month) {
                month = parseInt(shortDateParts.groups.month);
            }

            return {
                title,
                screeningId,
                cover,
                date,
                month,
                type
            }
        });
    });

    await browser.close();

    const now = moment();
    const year = now.year();
    const month = now.month() + 1; // moment month are 0 based

    for (const screening of screenings) {
        let dateObject = moment(screening.date, "dddd DD MMMM HH:mm", "fr");

        // Since the year is not included, moment use the current year as default.
        // When we are in december, some january dates may already have been announced.
        // For example, on the 17th of december 2019, a screening for the 2nd of january 2020 has been announced.
        // Moment tries to parse it with the current year and an invalid moment object is produced because the
        // day doesn't match (02/01/2020 is a thursday and 02/01/2019 was a wednesday).
        // So if the moment object is invalid and the month of the screening is a month that comes before the current
        // month, try to re-parse the date using next year.
        // If that fails, throw an error.
        if (!dateObject.isValid() && screening.month < month) {
            dateObject = moment(`${year + 1} ${screening.date}`, "YYYY dddd DD MMMM HH:mm", "fr");

            if (!dateObject.isValid()) {
                throw new Error(`Unable to parse a valid date for ${JSON.stringify(screening)}`);
            }
        }

        const date = dateObject.format("dddd DD MMMM [à] HH[h]mm");
        const timestamp = dateObject.unix();
        const id = `${timestamp}-${screening.screeningId}-${md5(screening.title)}`;

        screening.date = date;
        screening.timestamp = timestamp;
        screening.id = id;
        screening.bookingUrl = urls.screening(screening.screeningId);
    }

    return screenings;
}

export default { scrape }
