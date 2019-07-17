import dotenv from "dotenv";
import process from "process";
import path from "path";
import Sentry from "@sentry/node";

// read .env file
dotenv.config();

const dsn = process.env.SENTRY_DSN;
if (dsn) {
    Sentry.init({ dsn });
}

import broadcaster from "./broadcaster";
import database from "./database";
import scheduler from "./scheduler";
import scrapper from "./scrapper"
import urls from "./urls";
import theaters from "./theaters";
import { momentFromTimestamp, sortByTimestampDesc } from "./moment";

const theater = theaters.validate(process.env.UGC_THEATER || process.argv[2]);
const rootDir = path.normalize(path.join(path.dirname(process.argv[1]), '..'));

(async () => {
    const screeningsToRemind = [];
    const screeningsToAnnounce = [];
    const screenings = database.read(path.join(rootDir, 'films.json'));

    // scrape
    const scrappedScreenings = await scrapper.scrape(urls.theater(theater));

    // store if necessary
    for (const screening of scrappedScreenings) {
        let existingScreening = screenings.find(s => s.id === screening.id);

        if (!existingScreening) {
            screenings.push(screening);
            screeningsToAnnounce.push(screening);
        } else if (scheduler.shouldRemind(screening)) {
            screeningsToRemind.push(screening);
        }
    }

    for (const screening of screeningsToAnnounce) {
        try {
            await broadcaster.announce(screening);
        } catch (e) {
            Sentry.captureException(e);
        }
    }

    for (const screening of screeningsToRemind) {
        try {
            await broadcaster.remind(screening);
        } catch (e) {
            Sentry.captureException(e);
        }
    }

    database.save(screenings.filter(s => momentFromTimestamp(s.timestamp).isAfter()).sort(sortByTimestampDesc));
})();
