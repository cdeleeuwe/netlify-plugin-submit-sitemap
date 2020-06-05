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

// Submit sitemap to a provider. Returns either a successful or failed submission, but no error is thrown
const submitToProvider = async ({ provider, sitemapUrl }) => {
  if (!providerUrls[provider]) {
    return { message: `Provider ${provider} not found!`, error: 'Invalid provider' };
  }

  const providerUrl = providerUrls[provider](sitemapUrl);
  console.log(`Going to submit sitemap to ${provider} \n --> URL: ${providerUrl}`);

  try {
    await fetch(providerUrl);
  } catch (error) {
    return { message: `\u274c ERROR! was not able to submit sitemap to ${provider}`, error };
  }

  return { message: `\u2713  DONE! Sitemap submitted succesfully to ${provider}` };
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

    // submit sitemap to all providers
    const submissions = await Promise.all(
      providers.map(provider => submitToProvider({ provider, sitemapUrl }))
    );

    // For failed submissions, it might be better to use something like a utils.build.warn() as discussed here: 
    // https://github.com/cdeleeuwe/netlify-plugin-submit-sitemap/issues/4
    // But till then, just console.log the errors and fail the plugin.
    // ---
    // For successful submissions, it's better to use utils.status.show(), but currently Netlify doesn't show 
    // the status in the UI yet, so also console.log() it for now
    // See https://github.com/cdeleeuwe/netlify-plugin-submit-sitemap/issues/5
    submissions.forEach(({ error, message }) => {
      if (error) {
        console.error('\x1b[31m', message, '\x1b[0m');
      } else {
        console.log('\x1b[32m', message, '\x1b[0m');
      }
    });

    const messages = submissions
      .map(submission => submission.message)
      .join('\n');

    const errors = submissions
      .map(submission => submission.error)
      .filter(error => error);
    
    // If there was at least 1 error, fail the plugin, but continue the build.
    if (errors.length > 0) {
      utils.build.failPlugin(`${errors.length} sitemap submission(s) failed`, { error: errors[0] });
    }

    utils.status.show({ summary: 'Sitemap submitted succesfully', text: messages });
  }
};