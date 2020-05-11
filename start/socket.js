/**
 * Server
 * 
*/
const Server = use('Server')
let socketClient;
socketClient = socketClient || use('socket.io')(Server.getInstance(), { pingInterval: 2000, pingTimeout: 10000 });

/** Domains **/
const MatchDomain = use('App/Domain/MatchDomain')
const StatisticsDomain = use('App/Domain/StatisticsDomain')

/** General **/
const SocketEvents = use('App/Enum/SocketEvents')
const Socket = use("App/Helpers/Socket")

socketClient.on('connection', async (connection) => {
    const room = await Socket.createConnection(socketClient, connection);

    room.on(SocketEvents.STATISTICS_CLIENT_CONNECT, () => StatisticsDomain.clientConnect(room));
    
    room.on(SocketEvents.CLIENT_CONNECT, () => MatchDomain.clientConnect(room));

    room.on(SocketEvents.CLIENT_EVENT_JOIN_MATCH, ({ matchId, userId }) => MatchDomain.joinMatch(room, matchId, userId));

    room.on(SocketEvents.CLIENT_EVENT_SET_READY, ({ userId, matchId }) => MatchDomain.setReady(room, userId, matchId));

    room.on(SocketEvents.CLIENT_ANSWER_QUESTION, ({ userId, matchId, questionId, answer, time }) => MatchDomain.answerQuestion(userId, matchId, questionId, answer, time));

    room.on(SocketEvents.CLIENT_ANSWER_ANSWER_PLAY_AGAIN, ({ userId, matchId }) => MatchDomain.playAgainAnswer(userId, matchId));

    room.on(SocketEvents.CLIENT_EVENT_LEAVE_MATCH, () => MatchDomain.disconnectUserFromMatch(room));

    room.on(SocketEvents.CLIENT_DISCONNECT, () => MatchDomain.disconnectUserFromMatch(room));
});

exports.client = socketClient