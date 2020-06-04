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
  'google': (sitemapUrl) => `https://www.googddle.com/ping?sitemap=${sitemapUrl}`,
  'bing': (sitemapUrl) => `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
}

// Default parameters (can be overriden with inputs)
const defaults = {
  providers: Object.keys(providerUrls),
  baseUrl: URL,
  sitemapPath: '/sitemap.xml'
}

// Submit sitemap to a provider. Returns either a successful or failed submission, but no error is thrown
const submitToProvider = async ({ provider, sitemapUrl }) => {
  if (!providerUrls[provider]) {
    return { message: `Provider ${provider} not found!`, error: 'Invalid provider' };
  }

  const providerUrl = providerUrls[provider](sitemapUrl);
  console.log(`Going to submit sitemap to ${provider} \n * URL: ${providerUrl}`);

  try {
    await fetch(providerUrl);
  } catch (error) {
    return { message: `\u274c ERROR, was not able to submit sitemap to ${provider}`, error };
  }

  return { message: `\u2713 DONE! Sitemap submitted succesfully to ${provider}` };
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

    // // Only run on production branch
    // if (!isProduction()) {
    //   console.log(`Skip submitting sitemap to ${providers.join(', ')}, because this isn't a production build`);
    //   return;
    // }

    // submit sitemap to all providers
    const submissions = await Promise.all(
      providers.map(provider => submitToProvider({ provider, sitemapUrl }))
    );

    const messages = submissions
      .map(submission => submission.message)
      .join('\n');

    const errors = submissions
      .map(submission => submission.error)
      .filter(error => error);
    
    // If there was an error in 1 of the submissions, fail the plugin
    if (errors.length > 0) {
      utils.build.failPlugin(messages, { errors });
    }

    utils.status.show({ title: 'Main title', summary: 'Sitemap submitted successfully', text: messages });
  }
};