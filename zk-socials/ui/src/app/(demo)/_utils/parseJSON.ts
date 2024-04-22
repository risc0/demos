/**
 * A wrapper for "JSON.parse()"" to support "undefined" value
 */
export const parseJSON = <T>(value?: string | null): T | undefined => {
	try {
		return value === "undefined" ? undefined : (JSON.parse(value ?? "") as T);
	} catch {
		console.error("parsing error on", { value });

		return undefined;
	}
};
