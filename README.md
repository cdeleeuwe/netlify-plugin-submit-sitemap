# Netlify Build Plugin: Automatically submit your sitemap after every production build

Automatically submit your sitemap to **Google** and **Bing** after every production build!

This plugin will notify the search engines after every production build about your latest sitemap. The plugin can be used without any configuration if using the defaults.

## Usage

To install, add the following lines to your `netlify.toml` file:

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

	# Enabled providers to submit sitemap to (optional, default = 'google', 'bing'). Possible providers are currently only 'google' and 'bing'.
	providers = [
		"google",
		"bing"
	]
```

Note: The `[[plugins]]` line is required for each plugin, even if you have other plugins in your `netlify.toml` file already.
