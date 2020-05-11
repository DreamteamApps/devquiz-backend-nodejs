/**
 * Repository
 * 
*/
const UserRepository = use('App/Repository/UserRepository')

/** Models **/
const Database = use('Database')

/** Enum **/
const SocketEvents = use('App/Enum/SocketEvents')
const MatchStatus = use('App/Enum/MatchStatus')
const StatisticsType = use('App/Enum/StatisticsType')

/** DTO **/
const DTOUser = use('App/DTO/DTOUser')

/** General **/
const Socket = require('../../start/socket');
const Log = use("App/Helpers/Log")

let statistics;
let lastStatisticsChangeEmit = 0;
let statisticsChangeEmitDebounceTimeout = 0;

/**
 * On statistics client connects emits latest statistics to self
*/
module.exports.clientConnect = async (room) => {
    room.subscribeStatistics();

    await getLatestStatistics();

    room.emitToSelf(SocketEvents.STATISTICS_UPDATE, statistics);
}

/**
 * Increase a statistics value and emit this change
*/
module.exports.increaseStatisticsValue = async (key) => {
    let value = statistics[key] || 0;

    value++;

    statistics[key] = value;

    emitStatisticsChanges();
}

/**
 * Decrease a statistics value and emit this change
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
 * Sets a statistics object and emit this change
*/
module.exports.setStatisticsObject = async (key, object) => {
    statistics[key] = object;

    emitStatisticsChanges();
}

/**
 * Fetch and emit a new list of Top 10 players by win
*/
module.exports.refreshTop10PlayersByWin = async () => {
    await getTop10PlayersByWin();
}

/**
 * Emits statistics changes to all clients connected to statistics room, it has a debounce and a max time without update limiter
*/
const emitStatisticsChanges = async () => {
    const dateNowInMS = Date.now();

    Log.devLog(`Emited statistics changed called!`)

    if ((dateNowInMS - lastStatisticsChangeEmit) < 5000) {
        clearTimeout(statisticsChangeEmitDebounceTimeout);
    }

    statisticsChangeEmitDebounceTimeout = setTimeout(() => {
        lastStatisticsChangeEmit = dateNowInMS;

        Socket.client.to('statistics').emit(SocketEvents.STATISTICS_UPDATE, statistics);

        Log.devLog(`Emited ${SocketEvents.STATISTICS_UPDATE} to statistics!`)
    }, 2000);
}

/**
 * Initiate and refresh statistics data
*/
const getLatestStatistics = async () => {
    statistics = statistics || {};

    statistics = {
        [StatisticsType.TOTAL_PLAYERS_NOW]: Socket.client.engine.clientsCount
    };

    const totalMatchesPromise = Database.from('matches').getCount().then((totalMatches) => {
        statistics[StatisticsType.TOTAL_MATCHES] = totalMatches;
    });

    const totalMatchesNowPromise = await Database.from('matches').whereRaw(`status = '${MatchStatus.PLAYING}'`).getCount().then((totalMatchesNow) => {
        statistics[StatisticsType.TOTAL_MATCHES_NOW] = totalMatchesNow;
    });

    const totalPlayersPromise = await Database.from('users').getCount().then((totalPlayers) => {
        statistics[StatisticsType.TOTAL_PLAYERS] = totalPlayers;
    });

    const totalQuestionsPromise = await Database.from('questions').getCount().then((totalQuestions) => {
        statistics[StatisticsType.TOTAL_QUESTIONS] = totalQuestions;
    });

    await Promise.all([totalMatchesPromise,
        totalMatchesNowPromise,
        totalPlayersPromise,
        totalQuestionsPromise,
        getTop10PlayersByWin(),
        getRecentPlayers(),
        getTotalAnsweredQuestions(),
    ]);
}

/**
 * Get recent players
*/
const getRecentPlayers = async () => {
    const recentPlayers = await UserRepository.getRecentPlayers();

    const result = recentPlayers.map(player => new DTOUser(player));

    statistics[StatisticsType.RECENT_PLAYERS] = result;

    emitStatisticsChanges();
}

/**
 * Get the top 10 users by win
*/
const getTop10PlayersByWin = async () => {
    const top10UsersByWin = await UserRepository.getTop10UsersByWin();
    
    const result = top10UsersByWin.map(player => new DTOUser(player));
    
    statistics[StatisticsType.TOP_10PLAYERS_BY_WIN] = result;

    emitStatisticsChanges();
}

/**
 * Get the total question answers
*/
const getTotalAnsweredQuestions = async () => {
    const matches = await Database.table('matches').whereNot('last_questions', '');

    const totalAnsweredQuestions = matches.reduce((previous, current) => previous += current.last_questions.split(',').length, 0);

    statistics[StatisticsType.TOTAL_ANSWERED] = totalAnsweredQuestions;

    emitStatisticsChanges();
}

