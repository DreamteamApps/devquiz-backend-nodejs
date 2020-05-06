const Socket = require('../../start/socket');

/**
 * General
 * 
*/
const SocketEvents = use('App/Enum/SocketEvents')

let statistics;

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
const getLatestStatistics = async () => {
    if(!statistics) {
        statistics = {};

    }

    return statistics;
}

/**
 * Emits recent played to all connected clients when a client connect
*/
const emitStatisticsChanges = async (key, latestValue) => {
    const data = {
        [key]: latestValue
    };

    Socket.client.to('statistics').emit(SocketEvents.STATISTICS_UPDATE, data);
}

/**
 * Emits recent played to all connected clients when a client connect
*/
module.exports.increaseStatisticsValue = async (key) => {
    let value = statistics[key] || 0;
    
    value++;

    statistics[key] = value;

    emitStatisticsChanges(key, value);
}

/**
 * Emits recent played to all connected clients when a client connect
*/
module.exports.setStatisticsObject = async (key, object) => {
    statistics[key] = object;

    emitStatisticsChanges(key, object);
}