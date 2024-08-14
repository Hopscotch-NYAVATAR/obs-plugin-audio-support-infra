export function readFromEnv(name: string) {
	const value = process.env[name];
	if (value == null) {
		throw new Error(`Environment variable ${name} is not defined!`);
	}
	return value;
}
