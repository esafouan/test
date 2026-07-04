const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const url = 'https://1millionstories.net/after-working-a-brutal-12-hour-shift-i-came-home-and-discovered-that-my-mother-in-law/';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  
  const mainImage = $('.entry-content img').first();
  console.log('Main image src:', mainImage.attr('src'));
  console.log('Main image classes:', mainImage.attr('class'));
  console.log('Main image parent:', mainImage.parent().get(0).tagName, mainImage.parent().attr('class'));
}
test();
