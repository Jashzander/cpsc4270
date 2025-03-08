
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 1,
    "route": "/"
  },
  {
    "renderMode": 1,
    "route": "/login"
  },
  {
    "renderMode": 1,
    "route": "/playlists/new"
  },
  {
    "renderMode": 1,
    "route": "/playlists/*/edit"
  },
  {
    "renderMode": 1,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 21567, hash: '6208ea4bee103ae35fe2495df1e7303fa0b50b6555b9365f1d4e2fc3c6bde3fa', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 21800, hash: '880abe9c4766df8890a591366465fb67429c1e965811d80cb990ad0001835a12', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-AJ47LNJ7.css': {size: 547, hash: 'Qs6QxhWwVqg', text: () => import('./assets-chunks/styles-AJ47LNJ7_css.mjs').then(m => m.default)}
  },
};
