import { createPlaywrightRouter } from 'crawlee';
import { load } from 'cheerio';
import { state } from './main.js';
import { PLAYEROPTIONS } from './consts.js';

export const playwrightRouter = createPlaywrightRouter();

playwrightRouter.addHandler('team', async ({ request, page, log, crawler }) => {
    crawler.addRequests([{
        url: 'https://www.whoscored.com/StatisticsFeed/1/GetPlayerStatistics?category=blocks&subcategory=type&statsAccumulationType=0&isCurrent=true&playerId=&teamIds=133&matchId=&stageId=&tournamentOptions=17&sortBy=Rating&sortAscending=&age=&ageComparisonType=0&appearances=&appearancesComparisonType=0&field=&nationality=&positionOptions=%27FW%27,%27AML%27,%27AMC%27,%27AMR%27,%27ML%27,%27MC%27,%27MR%27,%27DMC%27,%27DL%27,%27DC%27,%27DR%27,%27GK%27,%27Sub%27&timeOfTheGameEnd=5&timeOfTheGameStart=0&isMinApp=&page=1&includeZeroValues=true&numberOfPlayersToPick=',
        label: 'player',
    }]);
});

playwrightRouter.addHandler('player', async ({ request, page, log, crawler }) => {
    for (const attr of Object.keys(PLAYEROPTIONS)) {
        for (const val of PLAYEROPTIONS[attr]) {
            await crawler.requestQueue.addRequest({
                url: `https://www.whoscored.com/StatisticsFeed/1/GetPlayerStatistics?category=${attr}&subcategory=${val}&statsAccumulationType=0&isCurrent=true&playerId=${request.userData.code}&teamIds=&matchId=&stageId=&tournamentOptions=&sortBy=Rating&sortAscending=&age=&ageComparisonType=0&appearances=&appearancesComparisonType=0&field=&nationality=&positionOptions=%27FW%27,%27AML%27,%27AMC%27,%27AMR%27,%27ML%27,%27MC%27,%27MR%27,%27DMC%27,%27DL%27,%27DC%27,%27DR%27,%27GK%27,%27Sub%27&timeOfTheGameEnd=5&timeOfTheGameStart=0&isMinApp=&page=1&includeZeroValues=true&numberOfPlayersToPick=`,
                label: 'parsePlayer',
                userData: {
                    infoKey: `1-${request.userData.code}`,
                },
            });
        }
    }
});

playwrightRouter.addHandler('parsePlayer', async ({ request, page, log, crawler }) => {
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

// https://www.whoscored.com/StatisticsFeed/1/GetPlayerStatistics?category=goals&subcategory=bodyparts&statsAccumulationType=0&isCurrent=true&playerId=&teamIds=133&matchId=&stageId=&tournamentOptions=17&includeZeroValues=true

// https://www.whoscored.com/StatisticsFeed/1/GetPlayerStatistics?category=shots&subcategory=zones&statsAccumulationType=0&isCurrent=true&playerId=&teamIds=133&matchId=&stageId=&tournamentOptions=17&sortBy=Rating&sortAscending=&age=&ageComparisonType=0&appearances=&appearancesComparisonType=0&field=&nationality=&positionOptions=%27FW%27,%27AML%27,%27AMC%27,%27AMR%27,%27ML%27,%27MC%27,%27MR%27,%27DMC%27,%27DL%27,%27DC%27,%27DR%27,%27GK%27,%27Sub%27&timeOfTheGameEnd=5&timeOfTheGameStart=0&isMinApp=&page=1&includeZeroValues=true&numberOfPlayersToPick=
