/** Models **/
const Database = use('Database')
const User = use("App/Models/User")

/** Enum **/
const UserType = use('App/Enum/UserType')


/**
 * Get by id
 *
 * @param {string} userId
*/
module.exports.getUserById = async (userId) => {
    const user = await User.findBy('id', userId);

    return user ? user.toObject() : null;
}

/**
 * Get by username
 *
 * @param {string} username
*/
module.exports.getUserByUsername = async (username) => {
    const user = await User.query().where('username', username).first();

    return user ? user.toObject() : null;
}

/**
 * Get by email
 *
 * @param {string} email
*/
module.exports.getUserByEmail = async (email) => {
    const user = await User.findBy('email', email);

    return user ? user.toObject() : null;
}

/**
 * Get by socket id
 *
 * @param {string} socketId
*/
module.exports.getUserBySocketId = async (socketId) => {
    const user = await User.findBy('socket_id', socketId);

    return user ? user.toObject() : null;
}

/**
 * Create
 *
 * @param {object} model
*/
module.exports.create = async ({ username, name }) => {
    const user = await User.create({
        username,
        name
    });

    return user ? user.toObject() : null;
}

/**
 * Update
 *
 * @param {object} model
*/
module.exports.update = async (model) => {
    let user = await User.findBy('id', model.id);

    const { id, ...modelToMerge } = model;

    user.merge(modelToMerge);

    await user.save();

    return user ? user.toObject() : null;
}

/**
 * Remove push token from other users
 *
 * @param {string} pushToken
 * @param {string} userId
*/
module.exports.removePushTokenFromOtherUsers = async (pushToken, userId) => {
    await User.query().where('push_token', pushToken).whereNot('id', userId).update({ push_token: null });
}

/**
 * Get recent players
 *
*/
module.exports.getRecentPlayers = async () => {
    const recentPlayers = await Database.table('users').where('type', UserType.USER).orderBy('updated_at', 'desc').limit(10);
    return recentPlayers;
}

/**
 * Get top 10 players by win
 *
*/
module.exports.getTop10UsersByWin = async () => {
    const top10PlayersByWin = await Database.table('users').where('type', UserType.USER).where('wins', '>', 0).orderBy('wins', 'desc').limit(10);
    return top10PlayersByWin;
}