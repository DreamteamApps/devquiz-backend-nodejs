/**
 * Server
 * 
*/
const env = use('Env')
const Server = use('Server')
const socketConnection = use('socket.io')(Server.getInstance(), { pingInterval: 2000, pingTimeout: 5000 });

/**
 * Domains
 * 
*/
const MatchDomain = use('App/Domain/MatchDomain')

/**
 * General
 * 
*/
const SocketEvents = use('App/Enum/SocketEvents')

socketConnection.on('connection', async (connection) => {
    const room = await createRoom(connection);
    
    devLog(`New client connected ${room.socketId}`);

    room.on(SocketEvents.CLIENT_EVENT_JOIN_MATCH, async (params) => {
        const { matchId, userId } = params;
        
        room.join(matchId);

        MatchDomain.joinMatch(room, matchId, userId);
    });


    room.on(SocketEvents.CLIENT_EVENT_SET_READY, async (params) => {
        const { userId, matchId } = params;

        MatchDomain.setReady(room, userId, matchId);
    });

    room.on(SocketEvents.CLIENT_ANSWER_QUESTION, async (params) => {
        const { userId, matchId, questionId, answer, time } = params;

        MatchDomain.answerQuestion(userId, matchId, questionId, answer, time);
    });

    room.on(SocketEvents.CLIENT_ANSWER_ANSWER_PLAY_AGAIN, async (params) => {
        const { userId, matchId } = params;

        MatchDomain.playAgainAnswer(userId, matchId);
    });

    room.on('disconnect', async () => {
        MatchDomain.disconnectUserFromMatch(room);
    });
});

const createRoom = async (connection) => {
    let _matchId;

    return {
        socketId: connection.id,
        join: (matchId) => {
            _matchId = matchId;
            connection.join(_matchId);
        },
        emit: (eventName, data, matchId) => {
            if(!_matchId && !matchId) return;

            devLog(`Emited ${eventName} to room ${_matchId || matchId}`, data ? JSON.stringify(data, null, 2) : '');
            socketConnection.to(_matchId || matchId).emit(eventName, data);
        },
        on: (eventName, callback) => {
            connection.on(eventName, (data) => {
                devLog(`Received ${eventName}`, data ? JSON.stringify(data, null, 2) : '');
                callback(data);
            });
        },
        leave: () => {
            if(!_matchId) return;
            connection.leave(_matchId);
        }
    }
}

const devLog = (...args) => {
    if (process.env.NODE_ENV == "development") {
        console.log(...args);
    }
}