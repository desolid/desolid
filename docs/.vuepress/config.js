const package = require('../../package.json');

module.exports = {
    title: package.title,
    description: package.description,
    head: [['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/logo_outline.png' }]],
    themeConfig: {
        logo: '/logo_outline.png',
        repo: 'desolid/desolid',
        docsDir: 'docs',
        editLinkText: 'Edit this page on GitHub',
        editLinks: true,
        searchPlaceholder: 'Search...',
        smoothScroll: true,
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Documents', link: '/Documents/' },
        ],
        displayAllHeaders: true, // Default: false
        // sidebar: ['/documents', '/documents/getting-started'],
        sidebar: [
            {
                title: 'Documents',
                collapsable: false,
                children: [
                    'documents/getting-started', //
                    'documents/aknowledgement',
                ],
            },
        ],
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
                ga: 'UA-128189152-1',
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
