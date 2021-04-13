import "jest-extended";

import { readFileSync } from "fs";
import { resolve } from "path";

import { Dotenv } from "../src";

const envFile = readFileSync(
	resolve(__dirname, "./fixtures/example.env")
).toString();

let subject: Dotenv;

beforeEach(() => (subject = new Dotenv()));

test("can parse a dotenv file", () => {
	expect(subject.parse(envFile).all()).not.toBeEmpty();
});

test("respects the whitelist", () => {
	expect(subject.whitelist(["LOG_CHANNEL"]).parse(envFile).all()).toEqual({
		LOG_CHANNEL: "stack",
	});
});

test("respects the blacklist", () => {
	expect(
		subject.blacklist(["LOG_CHANNEL"]).parse(envFile).all()
	).not.toContainKey("LOG_CHANNEL");
});

test("can parse and replace nested properties", () => {
	expect(subject.parse(envFile).all().NESTED).toBe("Laravel_Laravel_Laravel");
});

test("can parse and handle empty values", () => {
	expect(() =>
		subject.parse(envFile).required("IS_EMPTY").notEmpty().validate()
	).toThrowError("contains an invalid value");
});

test("can parse and cast strings", () => {
	const env = subject.parse(envFile);

	env.required("IS_STRING").isString().validate();

	expect(env.get("IS_STRING")).toBe("ABC");
});

test("can parse and cast integers", () => {
	const env = subject.parse(envFile);

	env.required(["IS_INTEGER", "IS_INTEGER_STRING"]).isInteger().validate();

	expect(env.get("IS_INTEGER")).toBe(123);
	expect(env.get("IS_INTEGER_STRING")).toBe(123);
});

test("can parse and cast booleans", () => {
	const env = subject.parse(envFile);

	env.required(["IS_BOOLEAN", "IS_BOOLEAN_STRING"]).isBoolean().validate();

	expect(env.get("IS_BOOLEAN")).toBeTrue();
	expect(env.get("IS_BOOLEAN_STRING")).toBeTrue();
});

test("can parse and allow or disallow certain values", () => {
	const env = subject.parse(envFile);

	env.required("ALLOWED").allowedValues(["Hello"]).validate();
	expect(() =>
		env.required("ALLOWED").allowedValues(["World"]).validate()
	).toThrowError("must be");

	env.required("ALLOWED").disallowedValues(["World"]).validate();
	expect(() =>
		env.required("ALLOWED").disallowedValues(["Hello"]).validate()
	).toThrowError("invalid value");
});

test("can load a dotenv file", () => {
	expect(
		subject.load(resolve(__dirname, "./fixtures/path.env")).all()
	).toEqual({ HELLO: "WORLD" });
});

test("can safe load a dotenv file", () => {
	expect(
		subject.safeLoad(resolve(__dirname, "./fixtures/fake.env")).all()
	).toEqual({});
});
