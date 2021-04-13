import {
	NEWLINE,
	NEWLINES_MATCH,
	RE_INI_KEY_VAL,
	RE_NEWLINES,
} from "./constants";
import { Variables } from "./types";

const NESTED = /\${([a-zA-Z0-9_.]+)}/g;

// todo: clean up the implementation
export class Parser {
	public static parse(src, { blacklist, whitelist }): Variables {
		const result: Variables = {};

		for (const line of src.toString().split(NEWLINES_MATCH)) {
			const keyValueArr = line.match(RE_INI_KEY_VAL);

			if (keyValueArr != null) {
				const key = keyValueArr[1];
				let value = keyValueArr[2] || "";
				const end = value.length - 1;
				const isDoubleQuoted: boolean = value[0] === '"' && value[end] === '"';
				const isSingleQuoted: boolean = value[0] === "'" && value[end] === "'";

				if (isSingleQuoted || isDoubleQuoted) {
					value = value.substring(1, end);

					if (isDoubleQuoted) {
						value = value.replace(RE_NEWLINES, NEWLINE);
					}
				} else {
					value = value.trim();
				}

				if (blacklist.length && blacklist.includes(key)) {
					continue;
				}

				if (whitelist.length && !whitelist.includes(key)) {
					continue;
				}

				result[key] = value;
			}
		}

		for (const [key, value] of Object.entries(result) as any) {
			if (NESTED.test(value)) {
				const matches = [...value.matchAll(NESTED)];

				for (const match of matches) {
					result[key] = value.split(match[0]).join(result[match[1]]);
				}
			}
		}

		return result;
	}
}
