import fs from "fs";
import os from "os";
import path from "path";
import process from "process";
import Axios from "axios";
import Twitter from "twit";
import Sentry from '@sentry/node';
import scheduler from './scheduler.js';

let client = null;

function getClient () {
    if (client === null) {
        client = new Twitter({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
            access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
            timeout_ms: 10000,
            strictSSL: true,
        });
    }

    return client;
}

async function downloadCover (url, destinationPath) {
    const response = await Axios({
        url,
        method: "GET",
        responseType: "stream"
    });

    if (response.statusText !== "OK") {
        return null;
    }

    const writer = fs.createWriteStream(destinationPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(destinationPath));
        writer.on("error", reject);
    });
}

async function uploadCover(sourcePath) {
    const coverResponse = await new Promise((resolve, reject) => getClient().postMediaChunked(
        {file_path: sourcePath},
        (err, response) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        })
    );

    return coverResponse.media_id_string;
}

async function downloadAndPublishCover(screening) {
    const destinationPath = path.join(os.tmpdir(), screening.id);

    let coverFile;

    // download the cover
    try {
        // try to get the large version first
        coverFile = await downloadCover(screening.cover.replace('/small/', '/large/'), destinationPath);
    } catch (e) {
        try {
            // if the large version fails, fallback to the small version
            coverFile = await downloadCover(screening.cover, destinationPath);
        } catch (e) {
            Sentry.captureException(e);
            return null;
        }
    }

    let coverId = null;

    // upload the cover to twitter to get the media_id that we can embed in the tweet
    try {
        coverId = await uploadCover(coverFile);
    } catch (e) {
        Sentry.captureException(e);
        return null;
    }

    // remove the downloaded file
    fs.unlinkSync(coverFile);

    return coverId;
}

async function postTweet(screening, text) {
    const dryRun = process.env.DRY_RUN;

    if (!!dryRun && (dryRun === "true" || dryRun === "1")) {
        console.log(text + (screening.cover ? ` (${screening.cover})` : ''));

        return { text };
    }

    const tweet = { status : text };

    if (screening.cover) {
        const coverId = await downloadAndPublishCover(screening);

        if (coverId) {
            tweet.media_ids = [coverId];
        }
    }

    const tweetResponse = await getClient().post("statuses/update", tweet);
    return tweetResponse.resp.statusMessage === "OK" ? tweetResponse.data : null;
}

export default {
    announce: async screening => {
        return postTweet(screening, `🍿 ${screening.title} 🍿\n📅 ${screening.date}\n\n🎟️ Réservation sur ${screening.bookingUrl}`);
    },
    remind: async screening => {
        const hint = scheduler.isToday(screening)
            ? " (c'est *aujourd'hui* ! ⌛)"
            : (scheduler.isTomorrow(screening) ? " (c'est demain ⏳)" : '');

        const date = `${screening.date}${hint}`;
        const text = `🍿 ${screening.title} 🍿\n📅 ${date}\n\n🎟️ Réservation sur ${screening.bookingUrl}`;
        return postTweet(screening, text);
    },
};
