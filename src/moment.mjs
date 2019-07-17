import moment from 'moment';

moment.locale('fr');

export function momentFromTimestamp(timestamp) {
    return moment(timestamp, 'X');
}

export function sortByTimestampDesc(screening1, screening2) {
    return screening2.timestamp - screening1.timestamp;
}

export function sortByTimestampAsc(screening1, screening2) {
    return screening1.timestamp - screening2.timestamp;
}

export default moment;
