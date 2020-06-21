import moment, { sortByTimestampDesc, sortByTimestampAsc, momentFromTimestamp } from "../src/moment";

const past = {timestamp: moment().subtract(1, "year").format("X")};
const present = {timestamp: moment().format("X")};
const future = {timestamp: moment().add(1, "year").format("X")};

test("sorting functions", () => {
    const unsorted = [future, past, present];

    const sortedAsc = unsorted.sort(sortByTimestampAsc);
    expect(sortedAsc).toIncludeAllMembers(unsorted);
    expect(sortedAsc[0]).toEqual(past);
    expect(sortedAsc[1]).toEqual(present);
    expect(sortedAsc[2]).toEqual(future);

    const sortedDesc = unsorted.sort(sortByTimestampDesc);
    expect(sortedDesc).toIncludeAllMembers(unsorted);
    expect(sortedDesc[0]).toEqual(future);
    expect(sortedDesc[1]).toEqual(present);
    expect(sortedDesc[2]).toEqual(past);
});

test("custom moment", () => {
    const date = moment("2019-01-01", "YYYY-MM-DD");
    expect(date.locale()).toBe("fr");
    expect(date.format("DD/MM/YYYY")).toBe("01/01/2019");
});

test("fromTimestamp", () => {
    const date = momentFromTimestamp(1546367445);
    expect(date.format("DD/MM/YYYY HH:mm:ss")).toBe("01/01/2019 19:30:45")
});
