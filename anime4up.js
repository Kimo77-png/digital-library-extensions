const BASE = 'https://anime4up.rest';
const API = BASE + '/wp-json/myapp/v1';
const PROXY = 'https://cold-sunset-453a.kimohossin52.workers.dev/?url=';

async function fetchJSON(path) {
  const res = await fetch(PROXY + encodeURIComponent(API + path));
  if (!res.ok) throw new Error('API error: ' + res.status);
  return res.json();
}

async function getPopular(page = 1) {
  const data = await fetchJSON('/home');
  if (data.status !== 'ok') throw new Error('Invalid response');
  return data.latest_episodes.map(ep => ({
    id: 'a4u_' + ep.id,
    title: ep.title,
    image: ep.thumbnail,
    url: ep.link,
    date: ep.date
  }));
}

window.DigitalLibraryExtensions = window.DigitalLibraryExtensions || {};
window.DigitalLibraryExtensions['anime4up'] = {
  name: 'Anime4up (Arabic)',
  lang: 'ar',
  baseUrl: BASE,
  getPopular
};
