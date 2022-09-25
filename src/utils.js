import { Actor } from 'apify';

export const mergeInformation = async (finalState) => {
    console.log(`Formatting the data from state.json...`);
    for (const key of Object.keys(finalState)) {
        if (key.startsWith('1')) {
            const player = finalState[key];
            const infoKey = `Player-${player[0].playerId}`;
            const uniquePlayerTournaments = Array.from(new Set(player.map((tournament) => `${tournament.tournamentName} - ${tournament.teamName}`)));
            const playerTournaments = {};
            for (const tournament of uniquePlayerTournaments) {
                if (!playerTournaments[tournament]) {
                    playerTournaments[tournament] = [];
                }
                playerTournaments[tournament].push(...player.filter((t) => `${t.tournamentName} - ${t.teamName}` === tournament));
            }
            for (const param of Object.keys(playerTournaments)) {
                playerTournaments[param] = playerTournaments[param].reduce(((r, c) => Object.assign(r, c)), {});
            }
            console.log(`Pushing data to the dataset`);
            await Actor.pushData({ [infoKey]: playerTournaments });
        }
        if (key.startsWith('2')) {
            const uniquePlayerInfo = {};
            for (const player of finalState[key]) {
                const infoKey = `Player-${player.playerId}`;
                const teamKey = `Team-${player.teamId}`;
                if (!uniquePlayerInfo[teamKey]) {
                    uniquePlayerInfo[teamKey] = {};
                }
                if (!uniquePlayerInfo?.[teamKey]?.[infoKey]) {
                    uniquePlayerInfo[teamKey][infoKey] = player;
                } else {
                    uniquePlayerInfo[teamKey][infoKey] = { ...uniquePlayerInfo[teamKey][infoKey], ...player };
                }
            }
            console.log(`Pushing data to the dataset`);
            await Actor.pushData(uniquePlayerInfo);
        }
    }
};

export const categorizeUrls = (startUrls) => {
    const labeledRequests = [];
    console.log(`Categorizing the startUrls...
Tip: The most efficient way to use this actor is to provide start urls of a competition or teams,
I recommend using player urls only if you want to scrape players for their performance in different competitions.
Use at least 8gb memory to run this actor.`);
    for (let { url } of startUrls) {
        if (url.endsWith('/')) url = url.slice(0, -1);
        const code = url.split('/')[4];
        if (url.startsWith('https://www.whoscored.com/') && url.includes('/Teams/') && url.includes('/Show/')) {
            labeledRequests.push({
                url,
                label: 'type',
                userData: {
                    code,
                    format: 2,
                }
            });
        } else if (url.startsWith('https://www.whoscored.com/') && url.includes('/Players/') && url.includes('/Show/')) {
            labeledRequests.push({
                url,
                label: 'type',
                userData: {
                    code,
                    format: 1,
                }
            });
        } else if (url.startsWith('https://www.whoscored.com/') && url.includes('/Tournaments/') && url.includes('/Regions/')) {
            labeledRequests.push({
                url,
                label: 'type',
                userData: {
                    code: url.split('/')[10],
                    format: 3,
                }
            });
        } else {
            throw new Error(`Invalid start url: ${url}
            Url should be in the following format:
            https://www.whoscored.com/Teams/13/Show/England-Arsenal
            https://www.whoscored.com/Players/279379/Show/Gabriel-Jesus
            https://www.whoscored.com/Regions/252/Tournaments/2/England-Premier-League`);
        }
    }
    return labeledRequests;
}

