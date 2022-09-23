import { Actor } from 'apify';
import { EventType, PlaywrightCrawler } from 'crawlee';
import { playwrightRouter } from './routes.js';
import { firefox } from 'playwright';
import { mergeInformation, categorizeUrls} from './utils.js';

await Actor.init();

const { startUrls } = await Actor.getInput();

const proxyConfiguration = await Actor.createProxyConfiguration({
    useApifyProxy: true,
    apifyProxyGroups: ['BUYPROXIES94952'],
});

export let state = await Actor.getValue('state') || {};

Actor.on(EventType.MIGRATING, async () => {
    console.log('Persisting state.json before the migration...');
    await Actor.setValue('state', state);
});

Actor.on(EventType.PERSIST_STATE, async () => {
    console.log(`Updated state.json in kv store, scraping contuinues...`);
    await Actor.setValue('state', state);
});

const initialRequests = categorizeUrls(startUrls);
const crawler = new PlaywrightCrawler({
    requestHandler: playwrightRouter,
    useSessionPool: true,
    proxyConfiguration,
    sessionPoolOptions: {
        maxPoolSize: 5,
    },
    launchContext: {
        launcher: firefox,
    },
    maxConcurrency: 20,
    navigationTimeoutSecs: 20
});

await crawler.run(initialRequests);

await Actor.setValue('state', state);

const finalState = await Actor.getValue('state');
await mergeInformation(finalState);

console.log(`Finished scraping.`);

await Actor.exit();
