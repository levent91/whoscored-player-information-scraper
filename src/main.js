import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';
import { playwrightRouter } from './routes.js';
import { firefox } from 'playwright';
import { mergeInformation } from './utils.js';

const input = await Actor.getInput();

const proxyConfiguration = await Actor.createProxyConfiguration({
    apifyProxyGroups: ['SHADER']
});

export const state = await Actor.getValue('state') || {};

Actor.on('MIGRATING', async () => {
    await Actor.setValue('state', state);
});

Actor.on('PERSISTSTATE', async () => {
    console.log(`Persisting state, got ${Object.keys(state).length} items so far...`);
    await Actor.setValue('state', state);
});

const startUrls = ['https://www.whoscored.com/Players/279379/Show/Gabriel-Jesus']

function categorizeUrls(startUrls) {
    const labeledRequests = [];

    for (let url of startUrls) {
        if (url.endsWith('/')) url = url.slice(0, -1);
        const code = url.split('/')[4];
        if (url.includes('/Teams/') && url.includes('/Show/')) {
            labeledRequests.push({
                url,
                label: 'team',
                userData: {
                    code,
                }
            });
        } else if (url.includes('/Players/') && url.includes('/Show/')) {
            labeledRequests.push({
                url,
                label: 'player',
                userData: {
                    code,
                }
            });
        }
    }
    return labeledRequests;
}

const initialRequests = categorizeUrls(startUrls);
const crawler = new PlaywrightCrawler({
    requestHandler: playwrightRouter,
    headless: false,
    useSessionPool: true,
    sessionPoolOptions: {
        maxPoolSize: 5,
    },
    launchContext: {
        launcher: firefox,
    },
    navigationTimeoutSecs: 20,
    preNavigationHooks: [
        async (crawlingContext, gotoOptions) => {
            gotoOptions.waitUntil = 'networkidle';
        }
    ],
});

await crawler.run(initialRequests);

await Actor.setValue('state', state);

const finalState = await Actor.getValue('state');
await mergeInformation(finalState);
// Exit successfully
await Actor.exit();
