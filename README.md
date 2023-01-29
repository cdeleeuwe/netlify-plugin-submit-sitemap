# Netlify Build Plugin: Automatically submit your sitemap after every production build

Automatically submit your sitemap to **Google**,**Bing** and **Yandex** after every production build!

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

	# Enabled providers to submit sitemap to (optional, default = 'google', 'yandex','bing'). Possible providers are currently only 'google', 'yandex','bing'.
	providers = [
		"google",
		"yandex",
		"bing",
	]

	# Enable IndexNow (default = false ,Required for Bing and Yandex)
	enableIndexNow = true

	#keyLocation (optional, In Case if Your key is Located at someware else)
	keyLocation = ""
```
## Instruction For Key
- Generate Your Key from [https://bing.com/indexnow](https://bing.com/indexnow) and put it in root of your site.
- visit [https://www.indexnow.org](https://www.indexnow.org) for more information about key.
- Your-key should have a minimum of 8 and a maximum of 128 hexadecimal characters. The key can contain only the following characters: lowercase characters (a-z), uppercase characters (A-Z), numbers (0-9), and dashes (-).
- If Your Key is Located at some where else, put the path to the key in keyLocation.
- Make Sure That You are not exposing your key in **sitemap.xml** file.
- see example for better understanding.

- ## If You enable IndexNow then Set **`INDEXNOW_KEY`** Environmental Variable as your Key



Note: The `[[plugins]]` line is required for each plugin, even if you have other plugins in your `netlify.toml` file already.

To complete file-based installation, from your project's base directory, use npm, yarn, or any other Node.js package manager to add this plugin to `devDependencies` in `package.json`.

```
npm install -D netlify-plugin-submit-sitemap
```

## Notes

- **DuckDuckGo** is not a supported provider because it currently doesn't offer any manual method where you can enter your sitemap or webpage URLs for indexing; more information can be found [here](https://www.monsterinsights.com/submit-website-to-search-engines/)

