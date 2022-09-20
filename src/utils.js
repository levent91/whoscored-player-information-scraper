import { Actor } from "apify";

/* eslint-disable max-len */
export const mergeInformation = async (finalState) => {
    for (const key of Object.keys(finalState)) {
        if (key.startsWith('1')) {
            // player tournamentId teamId
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
            await Actor.pushData({ [infoKey]: playerTournaments });
        }
    }
};
