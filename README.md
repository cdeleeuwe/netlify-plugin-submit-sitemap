# Netlify Build Plugin: Automatically submit your sitemap after every production build

Automatically submit your sitemap to **Google** and **Yandex** after every production build!

This plugin will notify the search engines after every production build about your latest sitemap. The plugin can be used without any configuration if using the defaults.

## Usage

You can install this plugin in the Netlify UI from this [direct in-app installation link](https://app.netlify.com/plugins/netlify-plugin-submit-sitemap/install) or from the [Plugins directory](https://app.netlify.com/plugins).

To use file-based installation, add the following lines to your `netlify.toml` file:

```toml
[build]
  publish = "public"

[[plugins]]
  package = "netlify-plugin-submit-sitemap"

	[plugins.inputs]

	# The base url of your site (optional, default = main URL set in Netlify)
	baseUrl = "https://example.com"

	# Path to the sitemap URL (optional, default = /sitemap.xml)
	sitemapPath = "/sitemap.xml"

	# Time in seconds to not submit the sitemap after successful submission
	ignorePeriod = 0

	# Enabled providers to submit sitemap to (optional, default = 'google', 'yandex'). Possible providers are currently only 'google', 'yandex'.
	providers = [
		"google",
		"yandex"
	]
```

Note: The `[[plugins]]` line is required for each plugin, even if you have other plugins in your `netlify.toml` file already.

To complete file-based installation, from your project's base directory, use npm, yarn, or any other Node.js package manager to add this plugin to `devDependencies` in `package.json`.

```
npm install -D netlify-plugin-submit-sitemap
```

## Notes

- **DuckDuckGo** is not a supported provider because it currently doesn't offer any manual method where you can enter your sitemap or webpage URLs for indexing; more information can be found [here](https://www.monsterinsights.com/submit-website-to-search-engines/)

- **Bing** is not supported anymore, since it deprecated anonymous sitemap submission since May 2022
