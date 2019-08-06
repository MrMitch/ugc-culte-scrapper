import scheduler from "../src/scheduler";
import moment from "../src/moment";

const yesterday = {timestamp: moment().subtract(1, 'day')};
const today = {timestamp: moment()};
const tomorrow = {timestamp: moment().add(1, 'day')};
const afterTomorrow = {timestamp: moment().add(2, 'days')};


test('isToday', () => {
    expect(scheduler.isToday(yesterday)).toBeFalse();
    expect(scheduler.isToday(today)).toBeTrue();
    expect(scheduler.isToday(tomorrow)).toBeFalse();
    expect(scheduler.isToday(afterTomorrow)).toBeFalse();
});

test('isTomorrow', () => {
    expect(scheduler.isTomorrow(yesterday)).toBeFalse();
    expect(scheduler.isTomorrow(today)).toBeFalse();
    expect(scheduler.isTomorrow(tomorrow)).toBeTrue();
    expect(scheduler.isTomorrow(afterTomorrow)).toBeFalse();
});

test('shoudlRemind', () => {
    expect(scheduler.shouldRemind(yesterday)).toBeFalse();
    expect(scheduler.shouldRemind(today)).toBeTrue();
    expect(scheduler.shouldRemind(tomorrow)).toBeTrue();
    expect(scheduler.shouldRemind(afterTomorrow)).toBeFalse();
});
