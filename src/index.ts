import { readFileSync } from "fs";

import { wrapArray } from "./helpers";
import { Parser } from "./parser";
import { Variable, Variables } from "./types";
import { Validator } from "./validator";

export class Dotenv {
	#repository: Variables = {};
	#whitelist: string[] = [];
	#blacklist: string[] = [];

	public all(): Variables {
		return this.#repository;
	}

	public get(key: string): Variable | undefined {
		return this.#repository[key];
	}

	public set(key: string, value: Variable): void {
		this.#repository[key] = value;
	}

	public parse(src: string): Dotenv {
		this.#repository = Parser.parse(src, {
			blacklist: this.#blacklist,
			whitelist: this.#whitelist,
		});

		return this;
	}

	public load(path: string): Dotenv {
		return this.parse(readFileSync(path).toString());
	}

	public safeLoad(path: string): Dotenv {
		try {
			return this.load(path);
		} catch {
			return this;
		}
	}

	public whitelist(variables: string | string[]): Dotenv {
		for (const variable of wrapArray(variables)) {
			this.#whitelist.push(variable);
		}

		return this;
	}

	public blacklist(variables: string | string[]): Dotenv {
		for (const variable of wrapArray(variables)) {
			this.#blacklist.push(variable);
		}

		return this;
	}

	public required(variables: string | string[]): Validator {
		return new Validator(this, wrapArray(variables)).required();
	}
}
