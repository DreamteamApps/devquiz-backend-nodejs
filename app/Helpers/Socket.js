/**
 * General
 * 
*/
const Log = use("App/Helpers/Log")

const rooms = {};

module.exports.createRoom = async (socketClient, connection) => {
    let _matchId;

    let room = {
        socketId: connection.id,
        matchId: () => _matchId,
        join: (matchId) => {
            _matchId = matchId;

            connection.join(matchId);

            Log.devLog(`New client connected ${connection.id}`);
        },
        emit: (eventName, data) => {
            if (!_matchId) return;

            socketClient.to(_matchId).emit(eventName, data);

            Log.devLog(`Emited ${eventName} to room ${_matchId}`, data ? JSON.stringify(data, null, 2) : '');
        },
        emitToAll: (eventName, data) => {

            socketClient.emit(eventName, data);

            Log.devLog(`Emited ${eventName} to all`, data ? JSON.stringify(data, null, 2) : '');
        },
        on: (eventName, callback) => {
            connection.on(eventName, (data) => {
                callback(data);

                Log.devLog(`Received ${eventName}`, data ? JSON.stringify(data, null, 2) : '');
            });
        },
        leave: () => {
            if (!_matchId) return;

            connection.leave(_matchId);

            rooms[connection.id] = null;
        }
    }

    rooms[connection.id] = room;

    return rooms[connection.id];
}