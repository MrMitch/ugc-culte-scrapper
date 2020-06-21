import fs from "fs";
import path from "path";

import database from "../src/database.js";

test("database.read doesn't fail when file doesn't exist (i.e. on first run)", () => {
    expect(database.path).toBeNull();
    let screenings = database.read("/tmp/non-existing-db.json");
    expect(screenings).toBeArrayOfSize(0);
});

test("database.save creates file if necessary", () => {
    const dbPath = path.resolve("test/fixtures/films-test.json");

    // db file should not exist
    expect(fs.existsSync(dbPath)).toBeFalse();

    const screenings = database.read(dbPath);
    expect(screenings).toBeArrayOfSize(0);

    screenings.push({title: "La La Land"});

    database.save(screenings);

    // db file should have been created
    expect(fs.existsSync(dbPath)).toBeTrue();

    // remove created db file
    fs.unlinkSync(dbPath);
});

test("database reads existing file", () => {
    const db = database.read(path.resolve("test/fixtures/films-theater-30.json"));
    expect(db).toBeArrayOfSize(3);
});
