import moment, { momentFromTimestamp } from "./moment";

const now = moment().startOf("minute");
const tomorrow = moment().startOf("minute").add(1, "day");

function isToday(screening) {
    return now.isSame(momentFromTimestamp(screening.timestamp), "day");
}
function isTomorrow(screening) {
    return tomorrow.isSame(momentFromTimestamp(screening.timestamp), "day");
}

export default {
    isToday,
    isTomorrow,
    shouldRemind: screening => {
        const screeningDate = momentFromTimestamp(screening.timestamp);

        return screeningDate.isAfter(now) && (isToday(screening) || isTomorrow(screening));
    }
}
