import path from 'path'

import { camelToKebab } from './store/index'
import payload from './store/payload.json'

export default {
  mode: 'universal',

  head: {
    titleTemplate: '%s - Brawl Time Ninja',
  },

  meta: {
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
    name: 'Brawl Time Ninja',
    description: 'Track Brawl Stars profile stats. Calculate your win rate, how many hours you play and other statistics. View Tier Lists for current events and get gameplay tips.',
    author: 'schneefux',
    theme_color: '#3490dc', // primary
  },

  pwa: {
    manifest: {
      name: 'Brawl Time Ninja',
      short_name: 'Brawl Time',
      description: 'Track Brawl Stars stats, hours played and view Tier Lists.',
      theme_color: '#3490dc', // primary
    },
    workbox: {
      // https://github.com/nuxt-community/pwa-module/issues/149
      // https://github.com/nuxt-community/pwa-module/issues/116#issuecomment-461534741
      // needed for Netlify
      // do not cache /_nuxt/*
      //cacheAssets: false,
      // do not cache /*
      offline: false,
    },
  },

  loading: { color: '#ffed4a' }, // secondary

  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/app.css',
  ],

  plugins: [
    { src: '~/plugins/persist', mode: 'client' },
    { src: '~/plugins/adsense', mode: 'client' },
    { src: '~/plugins/analytics', mode: 'client' },
    { src: '~/plugins/visibility', mode: 'client' },
  ],

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/redirect-module',
    '@nuxtjs/sitemap',
    '@nuxtjs/sentry',
  ],

  router: {
  },

  axios: {
  },

  redirect: [
    { from: '^/meta$', to: '/tier-list/brawler', statusCode: 301 },
    { from: '^/meta/(.*)$', to: '/tier-list/$1', statusCode: 301 },
  ],

  sentry: {
    dsn: 'https://8f9daacd6ab7467788de9869803c41e8@sentry.io/1882484',
    config: {},
  },

  env: {
    branch: process.env.BRANCH || '',
  },

  build: {
    extend(config, ctx) {
    },
    extractCSS: true,
    postcss: {
      plugins: {
        tailwindcss: path.resolve('./tailwind.config.js'),
        autoprefixer: {},
        ...(process.env.NODE_ENV === 'production'
        ? {
          '@fullhuman/postcss-purgecss': {
            content: [
              path.join(__dirname, './pages/**/*.vue'),
              path.join(__dirname, './layouts/**/*.vue'),
              path.join(__dirname, './components/**/*.vue'),
              path.join(__dirname, './store/payload.json'),
            ],
            defaultExtractor: content =>
              content.match(/[\w-\/:!/]+/g) || [],
            whitelist: ['html', 'body', 'nuxt-progress']
          }
        }: {})
      },
      preset: { autoprefixer: { grid: true } },
    },
  },

  sitemap: {
    // generated during run time
    gzip: true,
    exclude: ['/embed/**'],
    routes() {
      const routes = []

      const modes = []
      payload.events.forEach((event) => {
        if (!modes.includes(event.mode)) {
          const mode = camelToKebab(event.mode)
          modes.push(event.mode)
          routes.push(`/tier-list/mode/${mode}`)
        }
        routes.push(`/tier-list/map/${event.id}`)
      });

      [...Object.entries(payload.blog)].forEach(([topic, posts]) => {
        routes.push(`/blog/${topic}`)
        posts.forEach(post => routes.push(`/blog/${topic}/${post.id}`))
      })

      return routes
    },
  },

  generate: {
    fallback: true,
    routes() {
      const routes = []

      // do not include meta pages because they require dynamic data
      routes.push({
        route: '/',
      });

      [...Object.entries(payload.blog)].forEach(([topic, posts]) => {
        routes.push({
          route: `/blog/${topic}`,
        })
        posts.forEach(post => routes.push({
          route: `/blog/${topic}/${post.id}`,
        }))
      })

      return routes
    },
  },
}