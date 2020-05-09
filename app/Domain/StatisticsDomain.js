const Socket = require('../../start/socket');
/**
 * Models
 * 
*/
const Database = use('Database')

/**
 * General
 * 
*/
const SocketEvents = use('App/Enum/SocketEvents')
const MatchStatus = use('App/Enum/MatchStatus')
const StatisticsType = use('App/Enum/StatisticsType')
const UserType = use('App/Enum/UserType')
const Log = use("App/Helpers/Log")

let statistics;
let lastStatisticsChangeEmit = 0;
let statisticsChangeEmitDebounceTimeout = 0;

/**
 * Emits recent played to all connected clients when a client connect
*/
module.exports.clientConnect = async (room) => {
    room.subscribeStatistics();

    const latestStatistics = await getLatestStatistics();

    room.emitToSelf(SocketEvents.STATISTICS_UPDATE, latestStatistics);
}

/**
 * Emits recent played to all connected clients when a client connect
*/
module.exports.increaseStatisticsValue = async (key) => {
    let value = statistics[key] || 0;

    value++;

    statistics[key] = value;

    emitStatisticsChanges();
}

/**
 * Emits recent played to all connected clients when a client connect
*/
module.exports.decreaseStatisticsValue = async (key) => {
    let value = statistics[key] || 0;

    if (value > 0) {
        value--;
    }

    statistics[key] = value;

    emitStatisticsChanges();
}


/**
 * Emits recent played to all connected clients when a client connect
*/
module.exports.setStatisticsObject = async (key, object) => {
    statistics[key] = object;

    emitStatisticsChanges();
}


/**
 * Emits recent played to all connected clients when a client connect
*/
module.exports.refreshTop10PlayersByWin = async () => {
    getTop10PlayersByWin();
    emitStatisticsChanges();
}

/**
 * Emits recent played to all connected clients when a client connect
*/
const emitStatisticsChanges = async () => {
    const dateNowInMS = Date.now();
    const secondsInMS = 1000 * 20;
    const lastEmitDiffFromNowInMS = dateNowInMS - lastStatisticsChangeEmit;

    Log.devLog(`Emited statistics changed called!`)

    if (lastEmitDiffFromNowInMS < secondsInMS) {
        clearTimeout(statisticsChangeEmitDebounceTimeout);
    }

    statisticsChangeEmitDebounceTimeout = setTimeout(() => {
        lastStatisticsChangeEmit = Date.now();

        Socket.client.to('statistics').emit(SocketEvents.STATISTICS_UPDATE, statistics);

        Log.devLog(`Emited ${SocketEvents.STATISTICS_UPDATE} to statistics!`)
    }, 5000);
}

/**
 * Emits recent played to all connected clients when a client connect
*/
const getLatestStatistics = async () => {
    if (!statistics) {
        await prepareInitialData();
    }

    return statistics;
}

const prepareInitialData = async () => {
    statistics = {};

    const totalMatches = await Database.from('matches').getCount();
    statistics[StatisticsType.TOTAL_MATCHES] = totalMatches;

    const totalMatchesNow = await Database.from('matches').whereRaw(`status = '${MatchStatus.PLAYING}'`).getCount();
    statistics[StatisticsType.TOTAL_MATCHES_NOW] = totalMatchesNow;

    const totalPlayers = await Database.from('users').getCount();
    statistics[StatisticsType.TOTAL_PLAYERS] = totalPlayers;

    const totalPlayersNow = Socket.client.engine.clientsCount;
    statistics[StatisticsType.TOTAL_PLAYERS_NOW] = totalPlayersNow;

    const totalQuestions = await Database.from('questions').getCount();
    statistics[StatisticsType.TOTAL_QUESTIONS] = totalQuestions;

    const recentPlayers = await Database.table('users').where('type', UserType.USER).orderBy('updated_at', 'desc').limit(10);
    statistics[StatisticsType.RECENT_PLAYERS] = recentPlayers.map(p => ({
        id: p.id,
        name: p.username,
        avatar: p.image_url
    }));

    await getTotalAnsweredQuestions();

    await getTop10PlayersByWin();
}

const getTop10PlayersByWin = async () => {
    const top10PlayersByWin = await Database.table('users').where('type', UserType.USER).where('wins', '>', 0).orderBy('wins', 'desc').limit(10);
    
    statistics[StatisticsType.TOP_10PLAYERS_BY_WIN] = top10PlayersByWin;
    
    emitStatisticsChanges();
}

const getTotalAnsweredQuestions = async () => {
    const matches = await Database.table('matches').whereNot('last_questions', '');

    const totalAnsweredQuestions = matches.reduce((previous, current) => previous += current.last_questions.split(',').length, 0);
    
    statistics[StatisticsType.TOTAL_ANSWERED] = totalAnsweredQuestions;
    
    emitStatisticsChanges();
}

