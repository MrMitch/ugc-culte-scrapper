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
