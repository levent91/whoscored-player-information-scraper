/* eslint-disable no-case-declarations */
import { createPlaywrightRouter } from 'crawlee';
import { load } from 'cheerio';
import { state } from './main.js';
import { PLAYEROPTIONS } from './consts.js';

export const playwrightRouter = createPlaywrightRouter();

playwrightRouter.addHandler('type', async ({ request, page, crawler }) => {
    const { userData, label } = request;
    for (const attr of Object.keys(PLAYEROPTIONS)) {
        for (const val of PLAYEROPTIONS[attr]) {
            switch (userData.format) {
                case 1:
                    await crawler.requestQueue.addRequest({
                        url: `https://www.whoscored.com/StatisticsFeed/1/GetPlayerStatistics?category=${attr}&subcategory=${val}&statsAccumulationType=0&isCurrent=true&playerId=${userData.code}&teamIds=&matchId=&stageId=&tournamentOptions=&sortBy=Rating&sortAscending=&age=&ageComparisonType=0&appearances=&appearancesComparisonType=0&field=&nationality=&positionOptions=%27FW%27,%27AML%27,%27AMC%27,%27AMR%27,%27ML%27,%27MC%27,%27MR%27,%27DMC%27,%27DL%27,%27DC%27,%27DR%27,%27GK%27,%27Sub%27&timeOfTheGameEnd=5&timeOfTheGameStart=0&isMinApp=&page=1&includeZeroValues=true&numberOfPlayersToPick=`,
                        label: 'parsePlayer',
                        userData: {
                            infoKey: `${userData.format}-${userData.code}`,
                        },
                    });
                    break;
                case 2:
                    await crawler.requestQueue.addRequest({
                        url: `https://www.whoscored.com/StatisticsFeed/1/GetPlayerStatistics?category=${attr}&subcategory=${val}&statsAccumulationType=0&isCurrent=true&playerId=&teamIds=${userData.code}&matchId=&stageId=&tournamentOptions=&sortBy=Rating&sortAscending=&age=&ageComparisonType=0&appearances=&appearancesComparisonType=0&field=&nationality=&positionOptions=%27FW%27,%27AML%27,%27AMC%27,%27AMR%27,%27ML%27,%27MC%27,%27MR%27,%27DMC%27,%27DL%27,%27DC%27,%27DR%27,%27GK%27,%27Sub%27&timeOfTheGameEnd=5&timeOfTheGameStart=0&isMinApp=&page=1&includeZeroValues=true&numberOfPlayersToPick=`,
                        label: 'parseTeam',
                        userData: {
                            infoKey: `${userData.format}-${userData.code}`,
                            tournamentCode: userData.tournamentCode,
                        },
                    });
                    break;
                case 3:
                    const pageContent = await page.content();
                    const $ = load(pageContent);
                    const teamUrls = Array.from(new Set($('.team-link ').toArray().map((el) => $(el).attr('href'))) || []);
                    for (const url of teamUrls) {
                        await crawler.requestQueue.addRequest({
                            url: `https://www.whoscored.com${url}`,
                            label: 'type',
                            userData: {
                                code: url.split('/')[2],
                                format: 2,
                            },
                        });
                    }
                    break;
                default:
                    throw new Error(`Unknown label: ${label}`);
            }
        }
    }
});

playwrightRouter.addHandler('parsePlayer', async ({ request, page, log }) => {
    const { userData: { infoKey } } = request;
    const returnData = await page.content();
    const $ = load(returnData);
    const cleanedData = eval(`(${$('body').text()})`).playerTableStats;
    if (state[infoKey]) {
        state[infoKey] = state[infoKey].concat(cleanedData);
    } else {
        state[infoKey] = cleanedData;
    }
});

playwrightRouter.addHandler('parseTeam', async ({ request, page }) => {
    const { userData: { infoKey } } = request;
    const returnData = await page.content();
    const $ = load(returnData);
    const cleanedData = eval(`(${$('body').text()})`).playerTableStats;
    if (state[infoKey]) {
        state[infoKey] = state[infoKey].concat(cleanedData);
    } else {
        state[infoKey] = cleanedData;
    }
});
