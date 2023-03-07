import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const parser = new XMLParser();


const fetchSitemap = (url, timeout = 60000) => {
  const controller = new AbortController();
  const signal = controller.signal;

  setTimeout(() => {
    controller.abort();
  }, timeout);

  return fetch(url, { signal, agent })
    .then((res) => res.text())
    .then((xml) => {
      const { sitemapindex, urlset } = parser.parse(xml);

      // sitemap contains URLs directly, return them
      if (urlset)
        // Sitemap contains URLs directly, return them
        return 'loc' in urlset.url
          ? urlset.url.loc // Only single URL in sitemap
          : urlset.url.map((link) => link.loc); // Multiple URLs. in sitemap

      // Sitemap contains URLs to other sitemap(s), download them resursively
      if (sitemapindex) {
        // Contains only a single sitemap
        if ('loc' in sitemapindex.sitemap) return Promise.all([fetchSitemap(sitemapindex.sitemap.loc)]);

        // Recursively fetch all sitemaps inside current sitemap and fetch links
        // Using Promise.all() for running in parallel
        return Promise.all(sitemapindex.sitemap.map((sitemap) => fetchSitemap(sitemap.loc)));
      }

      // Something else, return empty array
      return [];
    })
    .catch((e) => console.log(e));
};

const getSitemapLinks = async (url, timeout = 60000) => {
  try {
    // Fetch sitemap recursively
    let links = (await fetchSitemap(url, timeout));

    // Flattern array
    links = links.flat(Infinity);

    // Get only unique links
    links = [...new Set(links)];
    return links;
  } catch (e) {
    throw new Error(`Unable to fetch sitemap. ${e}`);
  }
};

export default getSitemapLinks;
