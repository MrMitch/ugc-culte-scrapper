import theaters from "../src/theaters";

test("validate passes", () => {
    expect(theaters.validate(30)).toBe(30);
    expect(theaters.validate("30")).toBe(30);
    expect(theaters.validate("strasbourg")).toBe(30);
});

test("validate fails", () => {
    expect(() => theaters.validate()).toThrowWithMessage(Error, /^No theater specified/);
    expect(() => theaters.validate(99)).toThrowWithMessage(Error, /^Invalid theater id/);
    expect(() => theaters.validate("mulhouse")).toThrowWithMessage(Error, /^Invalid theater key/);
});

test("getName returns correct name", () => {
    expect(() => theaters.getName(30).toBe("strasbourg"));
    expect(() => theaters.getName(10).toBe("paris-les-hales"));
    expect(() => theaters.getName(38).toBe("o-parinor"));
});

test("getName fails", () => {
    expect(() => theaters.getName(9999999).toThrowWithMessage(Error, /^Unable to find theater name/));
    expect(() => theaters.getName('invalid').toThrowWithMessage(Error, /^Unable to find theater name/));
    expect(() => theaters.getName().toThrowWithMessage(Error, /^Unable to find theater name/));
});
