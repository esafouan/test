const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://1millionstories.net/';
const TARGET_ARTICLES = 40;
const OUTPUT_DIR = path.join(__dirname, '../public/images');
const DATA_FILE = path.join(__dirname, '../src/lib/articles.json');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

async function downloadImage(url, filename) {
  if (!url || url.startsWith('data:')) return null;
  const cleanUrl = url.split('?')[0];
  let ext = path.extname(cleanUrl) || '.jpg';
  if (ext.length > 5) ext = '.jpg';
  
  const finalFilename = filename || `img-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
  const imagePath = path.join(OUTPUT_DIR, finalFilename);
  
  if (fs.existsSync(imagePath)) return `/images/${finalFilename}`;

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000,
    });
    return new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(imagePath))
        .on('finish', () => resolve(`/images/${finalFilename}`))
        .on('error', e => reject(e));
    });
  } catch (error) {
    console.error(`Failed to download image ${url}:`, error.message);
    return null;
  }
}

async function scrapeArticlePart(url, partNumber) {
  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(data);
    
    const elements = [];
    const nodes = $('.entry-content').find('p').toArray();
    
    for (const el of nodes) {
      const tagName = el.tagName.toLowerCase();
      
      if (tagName === 'p') {
        const text = $(el).text().trim();
        // Ignore "Part X" paragraphs if they are just pagination
        if (text && !text.toLowerCase().startsWith('part ') && text.length > 1) {
          elements.push({ type: 'text', content: text });
        }
      }
    }

    // Check for next part
    let nextUrl = null;
    const nextBtn = $('.custom-nav-buttons .nav-btn.next-btn a');
    if (nextBtn.length) {
      nextUrl = nextBtn.attr('href');
    }

    return { elements, nextUrl, $ };
  } catch (error) {
    console.error(`Error scraping article part ${url}:`, error.message);
    return null;
  }
}

async function scrapeArticle(url) {
  console.log(`Scraping article: ${url}`);
  let currentUrl = url;
  let partNumber = 1;
  const parts = [];
  
  let title = '';
  let author = '';
  let date = '';
  let category = '';
  let thumbnail = null;

  while (currentUrl) {
    console.log(` -> Fetching part ${partNumber}`);
    const result = await scrapeArticlePart(currentUrl, partNumber);
    if (!result) break;
    
    if (partNumber === 1) {
      const { $ } = result;
      title = $('.entry-title').first().text().trim();
      author = $('.entry-author a').first().text().trim() || 'Unknown';
      date = $('.entry-date').first().text().trim() || new Date().toLocaleDateString();
      category = $('.entry-category a').first().text().trim() || $('.cat-links a').first().text().trim() || 'General';
      
      let imageUrl = $('.entry-content img').first().attr('src') || $('.entry-content img').first().attr('data-src') || $('.wp-post-image').first().attr('src');
      if (imageUrl) {
        thumbnail = await downloadImage(imageUrl);
      }
    }

    parts.push({
      partNumber,
      elements: result.elements
    });

    currentUrl = result.nextUrl;
    partNumber++;
    await new Promise(r => setTimeout(r, 500)); // anti rate-limit
  }

  // Get summary from first part's first text element
  let summary = '';
  if (parts.length > 0 && parts[0].elements.length > 0) {
    const firstText = parts[0].elements.find(e => e.type === 'text');
    if (firstText) summary = firstText.content.substring(0, 150) + '...';
  }

  if (parts.length === 0 || !title) return null;

  return {
    slug: url.replace(BASE_URL, '').replace(/\//g, ''),
    title,
    author,
    date,
    category,
    parts,
    summary,
    image: thumbnail
  };
}

async function main() {
  const articles = [];
  let page = 1;
  const visited = new Set();

  while (articles.length < TARGET_ARTICLES) {
    const pageUrl = page === 1 ? BASE_URL : `${BASE_URL}page/${page}/`;
    console.log(`Scraping index page ${pageUrl}...`);
    
    try {
      const { data } = await axios.get(pageUrl, { timeout: 10000 });
      const $ = cheerio.load(data);
      
      const links = [];
      $('.entry-title a').each((i, el) => {
        const link = $(el).attr('href');
        if (link && !visited.has(link)) {
          visited.add(link);
          links.push(link);
        }
      });

      if (links.length === 0) break;

      for (const link of links) {
        if (articles.length >= TARGET_ARTICLES) break;
        const articleData = await scrapeArticle(link);
        if (articleData) {
          articles.push(articleData);
          console.log(`[${articles.length}/${TARGET_ARTICLES}] Saved: ${articleData.title}`);
        }
      }
      page++;
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
      break;
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2));
  console.log(`Saved ${articles.length} articles to ${DATA_FILE}`);
}

main();
