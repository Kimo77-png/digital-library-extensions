const BASE = 'https://anime4up.rest';
const API = BASE + '/wp-json/myapp/v1';
const PROXY = 'https://cold-sunset-453a.kimohossin52.workers.dev/?url=';

async function fetchJSON(path) {
  const res = await fetch(PROXY + encodeURIComponent(API + path));
  if (!res.ok) throw new Error('API error: ' + res.status);
  return res.json();
}

// Get popular/latest episodes
async function getPopular(page = 1) {
  const data = await fetchJSON('/home');
  if (data.status !== 'ok') throw new Error('Invalid response');
  return data.latest_episodes.map(ep => ({
    id: 'a4u_' + ep.id,
    title: ep.title,
    image: ep.thumbnail,
    url: ep.link,
    date: ep.date,
    episodeId: ep.id  // keep the numeric episode ID
  }));
}

// Get episode video details (download links, servers, etc.)
async function getEpisodeDetails(postId) {
  const data = await fetchJSON('/episode/' + postId);
  if (data.status !== 'ok') throw new Error('Episode not found');
  let videoUrl = null;
  const servers = [];
  // Extract download links / servers from API response
  if (data.download_links && data.download_links.length) {
    videoUrl = data.download_links[0].url;
    servers.push(...data.download_links);
  } else if (data.servers && data.servers.length) {
    videoUrl = data.servers[0].url;
    servers.push(...data.servers);
  }
  return {
    title: data.title,
    thumbnail: data.thumbnail,
    videoUrl: videoUrl,
    servers: servers.map(s => ({
      name: s.server || s.name || 'Server',
      quality: s.quality || 'HD',
      url: s.url,
      language: s.language || 'Arabic'
    }))
  };
}

// Get all episodes (paginated)
async function getAllEpisodes(page = 1) {
  const data = await fetchJSON('/episodes');
  if (data.status !== 'ok') return [];
  return data.episodes.map(ep => ({
    id: 'a4u_' + ep.id,
    title: ep.title,
    image: ep.thumbnail,
    url: ep.link,
    date: ep.date,
    description: ep.description,
    episodeId: ep.id
  }));
}

// Get anime categories
async function getCategories() {
  const data = await fetchJSON('/categories');
  if (data.status !== 'ok') return [];
  return data.categories || [];
}

// Search anime
async function search(query, page = 1) {
  const data = await fetchJSON('/search?s=' + encodeURIComponent(query));
  if (data.status !== 'ok') return [];
  return data.results.map(ep => ({
    id: 'a4u_' + ep.id,
    title: ep.title,
    image: ep.thumbnail,
    url: ep.link,
    episodeId: ep.id
  }));
}

window.DigitalLibraryExtensions = window.DigitalLibraryExtensions || {};
window.DigitalLibraryExtensions['anime4up'] = {
  name: 'Anime4up (Arabic)',
  lang: 'ar',
  baseUrl: BASE,
  getPopular,
  search,
  getEpisodeDetails,
  getAllEpisodes,
  getCategories
};
