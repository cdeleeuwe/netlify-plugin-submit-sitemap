const url = require('url');
const fetch = require('node-fetch');
const {
  CONTEXT,
  URL,
} = process.env;

const isProduction = () => {
  return CONTEXT === 'production';
}

const providerUrls = {
  'google': (sitemapUrl) => `https://www.google.com/ping?sitemap=${sitemapUrl}`,
  'bing': (sitemapUrl) => `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
}

// Default parameters (can be overriden with inputs)
const defaults = {
  providers: Object.keys(providerUrls),
  baseUrl: URL,
  sitemapPath: '/sitemap.xml'
}

const submitToProvider = async ({ utils, provider, sitemapUrl }) => {
  if (!providerUrls[provider]) {
    console.error(`Provider ${provider} not found!`);
    return;
  }

  const providerUrl = providerUrls[provider](sitemapUrl);

  console.log(`Going to submit sitemap to ${provider}, URL: ${providerUrl}`);

  try {
    await fetch(providerUrl);
  } catch (error) {
    console.log(`\n \u274c ERROR, was not able to submit sitemap to ${provider}`);
    console.log(error);
  }

  console.log(`\n \u2713 DONE! Sitemap submitted succesfully to ${provider}\n`);
}

// helper
const removeEmptyValues = (obj) => {
  return Object.keys(obj)
    .filter(key => obj[key] != null)
    .reduce((prev, curr) => {
      prev[curr] = obj[curr];
      return prev;
    }, {});
};

module.exports = {
  async onSuccess({ utils, inputs }) {
    const { providers, baseUrl, sitemapPath } = {
      ...defaults, ...removeEmptyValues(inputs)
    }
    const sitemapUrl = (new url.URL(sitemapPath, baseUrl)).href;

    // Only run on production branch
    if (!isProduction()) {
      console.log(`Skip submitting sitemap to ${providers.join(', ')}, because this isn't a production build`);
      return;
    }

    await Promise.all(
      providers.map(provider => submitToProvider({ utils, provider, sitemapUrl }))
    );
  }
};