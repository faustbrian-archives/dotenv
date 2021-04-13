import Joi from "@hapi/joi";

export class Validator {
	#repository;
	#variables: string[] = [];

	#required = false;
	#schema = {};

	public constructor(repository, variables: string[]) {
		this.#repository = repository;
		this.#variables = variables;

		this.applyRule(() => Joi.any());
	}

	public required(): Validator {
		this.#required = true;

		return this;
	}

	public notEmpty(): Validator {
		this.applyRule(() => Joi.invalid(""));

		return this;
	}

	public isString(): Validator {
		this.applyRule(() => Joi.string());

		return this;
	}

	public isInteger(): Validator {
		this.applyRule(() => Joi.number().integer());

		return this;
	}

	public isBoolean(): Validator {
		this.applyRule(() => Joi.boolean());

		return this;
	}

	public allowedValues(choices: string[]): Validator {
		this.applyRule((variable) => this.#schema[variable].valid(...choices));

		return this;
	}

	public disallowedValues(choices: string[]): Validator {
		this.applyRule((variable) => this.#schema[variable].invalid(...choices));

		return this;
	}

	public validate(): void {
		if (this.#required) {
			this.applyRule((variable) => this.#schema[variable].required());
		}

		const { value, error } = Joi.object(
			this.#schema
		).validate(this.#repository.all(), { allowUnknown: true });

		if (error) {
			throw new Error(error);
		}

		for (const variable of this.#variables) {
			this.#repository.set(variable, value[variable]);
		}
	}

	private applyRule(callback): Validator {
		for (const variable of this.#variables) {
			this.#schema[variable] = callback(variable);
		}

		return this;
	}
}
