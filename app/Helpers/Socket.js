/** General **/
const Log = use("App/Helpers/Log")

const connections = {};

module.exports.createConnection = async (socketClient, socketConnection) => {
    let _matchId;

    let connection = {
        socketId: socketConnection.id,
        matchId: () => _matchId,
        totalConnections: () => {
            return socketClient.engine.clientsCount;
        },
        on: (eventName, callback) => {
            socketConnection.on(eventName, (data) => {
                callback(data);

                Log.devLog(`Received ${eventName}`, data ? JSON.stringify(data, null, 2) : '');
            });
        },
        emitToAll: (eventName, data) => {

            socketClient.emit(eventName, data);

            Log.devLog(`Emited ${eventName} to all`, data ? JSON.stringify(data, null, 2) : '');
        },
        emitToSelf: (eventName, data) => {

            socketConnection.emit(eventName, data);

            Log.devLog(`Emited ${eventName} to self`, data ? JSON.stringify(data, null, 2) : '');
        },
        joinMatch: (matchId) => {
            _matchId = matchId;

            socketConnection.join(matchId);

            Log.devLog(`New user ${socketConnection.id} connected`);
        },
        emitToMatch: (eventName, data) => {
            if (!_matchId) return;

            socketClient.to(_matchId).emit(eventName, data);

            Log.devLog(`Emited ${eventName} to match ${_matchId}`, data ? JSON.stringify(data, null, 2) : '');
        },
        leaveMatch: () => {
            if (!_matchId) return;

            socketConnection.leave(_matchId);

            connections[socketConnection.id] = null;
        },
        subscribeStatistics: () => {

            socketConnection.join('statistics');

            Log.devLog(`New client ${socketConnection.id} subscribed to statistics`);
        },
        emitStatistics: (eventName, data) => {

            socketClient.to('statistics').emit(eventName, data);

            Log.devLog(`Emited ${eventName} to statistics`, data ? JSON.stringify(data, null, 2) : '');
        },
    }

    connections[socketConnection.id] = connection;

    return connections[socketConnection.id];
}