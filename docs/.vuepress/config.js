const package = require('../../package.json');
const { sidebarTree } = require('../reference/config');

module.exports = {
    title: package.title,
    description: package.description,
    head: [['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/logo_outline.png' }]],
    themeConfig: {
        logo: '/logo_outline.png',
        repo: 'desolid/desolid',
        docsDir: 'docs',
        docsBranch: 'develop',
        editLinkText: 'Edit this page on GitHub',
        editLinks: true,
        searchPlaceholder: 'Search...',
        smoothScroll: true,
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide/' },
            { text: 'Reference', link: '/reference/' },
            { text: 'Blog', link: 'https://dev.to/desolid' },
        ],
        displayAllHeaders: true, // Default: false
        sidebar: {
            ...sidebarTree('Reference'),
            '/guide/': [
                {
                    title: 'Guide',
                    collapsable: false,
                    children: [
                        'getting-started', //
                        'cli',
                        'built-in-models',
                        'aknowledgement',
                    ],
                },
            ],
        },
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@assets': './assets',
            },
        },
    },

    plugins: [
        ['@vuepress/back-to-top', true],
        [
            '@vuepress/pwa',
            {
                serviceWorker: true,
                updatePopup: true,
            },
        ],
        ['@vuepress/medium-zoom', true],
        [
            '@vuepress/google-analytics',
            {
                ga: 'UA-57976308-6',
            },
        ],
        [
            'container',
            {
                type: 'vue',
                before: '<pre class="vue-container"><code>',
                after: '</code></pre>',
            },
        ],
        [
            'container',
            {
                type: 'upgrade',
                before: (info) => `<UpgradePath title="${info}">`,
                after: '</UpgradePath>',
            },
        ],
        ['flowchart'],
    ],
};
