import url from "url";
import fetch from "node-fetch";
import GetSitemapLinks from "./sitemap-url.js";

import { isInIgnorePeriod, setLastSubmitTimestamp } from "./helpers.js";
const { CONTEXT, URL } = process.env;

const providerUrls = {
	bing: () => `https://www.bing.com/indexnow`,
	yandex: () => `https://www.yandex.com/indexnow`,
	google: (sitemapUrl) => `https://www.google.com/ping?sitemap=${sitemapUrl}`,
};

// Default parameters (can be overriden with inputs)
const defaults = {
	providers: Object.keys(providerUrls),
	baseUrl: URL,
	sitemapPath: "/sitemap.xml",
	key: "",
	keyLocation: "",
};

// Submit sitemap to a provider. Returns either a successful or failed submission, but no error is thrown
const submitToProvider = async ({
	provider,
	sitemapUrl,
	baseUrl,
	key,
	keyLocation,
}) => {
	// If the provider is google,
	if (provider === "google") {
		try {
			const googleproviderUrl = providerUrls[provider](sitemapUrl);
			await fetch(googleproviderUrl).then(
				() => {
          return {
            message: `\u2713 DONE! Sitemap submitted succesfully to ${provider}`,
          };
        });
		} catch (error) {
			return {
				message: `\u274c ERROR! was not able to submit sitemap to ${provider}`,
				error,
			};
		}
	}
  const providerUrl = providerUrls[provider]();
	console.log(
		`Going to submit sitemap to ${provider} \n --> URL: ${providerUrl}`
	);
	const urlArray = await GetSitemapLinks(sitemapUrl);
  const defaultReqBody = {
		host: baseUrl,
		key: key,
		keyLocation: keyLocation || "",
		urlList: urlArray,
	};
	try {
		await fetch(providerUrl,{method: "POST", body:JSON.stringify(defaultReqBody)})
	} catch (error) {
		return {
			message: `\u274c ERROR! was not able to submit sitemap to ${provider}`,
			error,
		};
	}

	return {
		message: `\u2713 DONE! Sitemap submitted succesfully to ${provider}`,
	};
};


// helpers
const removeEmptyValues = (obj) => {
	return Object.keys(obj)
		.filter((key) => obj[key] != null)
		.reduce((prev, curr) => {
			prev[curr] = obj[curr];
			return prev;
		}, {});
};

// Make sure the url is prepended with 'https://'
const prependScheme = (baseUrl) => {
	return baseUrl.match(/^[a-zA-Z]+:\/\//)
		? baseUrl
		: (baseUrl = `https://${baseUrl}`);
};

export const onSuccess = async (props) => {
	const { utils, inputs, constants } = props;
	const { providers, baseUrl, sitemapPath,key,keyLocation} = {
		...defaults,
		...removeEmptyValues(inputs),
	};

	// Only run on production builds
	if (constants.IS_LOCAL || CONTEXT !== "production") {
		console.log(
			`Skip submitting sitemap to ${providers.join(
				", "
			)}, because this isn't a production build`
		);
		return;
	}

	// Do not run if we are within the ignore period
	if (await isInIgnorePeriod(props)) {
		console.log(
			`Skip submitting sitemap, because it's within the ignore period`
		);
		return;
	}

	let sitemapUrl;
	const baseUrlWithScheme = prependScheme(baseUrl);
	try {
		sitemapUrl = new url.URL(sitemapPath, baseUrlWithScheme).href;
	} catch (error) {
		return utils.build.failPlugin(
			`Invalid sitemap URL! baseUrl: ${baseUrlWithScheme}, sitemapPath: ${sitemapPath}`,
			{ error }
		);
	}

	// submit sitemap to all providers
	const submissions = await Promise.all(
		providers.map((provider) => submitToProvider({ provider, sitemapUrl,key,keyLocation }))
	);

	// For failed submissions, it might be better to use something like a utils.build.warn() as discussed here:
	// https://github.com/cdeleeuwe/netlify-plugin-submit-sitemap/issues/4
	// But till then, just console.log the errors and fail the plugin.
	// ---
	// For successful submissions, it's better to use utils.status.show(), but currently Netlify doesn't show
	// the status in the UI yet, so also console.log() it for now
	// See https://github.com/cdeleeuwe/netlify-plugin-submit-sitemap/issues/5
	submissions.forEach(({ error, isWarning, message }) => {
		if (error) {
			console.error("\x1b[31m", message, "\x1b[0m");
		} else if (isWarning) {
			console.log("\x1b[33m", message, "\x1b[0m");
		} else {
			console.log("\x1b[32m", message, "\x1b[0m");
		}
	});

	const messages = submissions
		.map((submission) => submission.message)
		.join("\n");

	const errors = submissions
		.map((submission) => submission.error)
		.filter((error) => error);

	// If there was at least 1 error, fail the plugin, but continue the build.
	if (errors.length > 0) {
		utils.build.failPlugin(`${errors.length} sitemap submission(s) failed`, {
			error: errors[0],
		});
		return;
	}

	await setLastSubmitTimestamp(props);
	utils.status.show({
		summary: "Sitemap submitted succesfully",
		text: messages,
	});
};
