/**
 * Models
 * 
*/
const Database = use('Database')
const User = use("App/Models/User")

/**
 * Domain
 * 
*/
const StatisticsDomain = use('App/Domain/StatisticsDomain')

/**
 * General
 * 
*/
const GitHub = use("App/Infrastructure/Github")
const UserType = use('App/Enum/UserType')
const StatisticsType = use('App/Enum/StatisticsType')

/**
 * Gets a user in github, create it or update in our database and return it
 *
 * @param {string} githubUser
*/
module.exports.getOrCreateUser = async (githubUser, pushToken) => {
    let existingUser = await User.findBy('username', githubUser);

    const { login, name, public_repos, avatar_url, etag } = await GitHub.getUserInformation(githubUser, existingUser && existingUser.github_etag);

    if (!login && !existingUser) {
        return {
            "errorCode": 1,
            "message": "This user doesn't exists!"
        }
    }
    
    if (!existingUser) {
        StatisticsDomain.increaseStatisticsValue(StatisticsType.TOTAL_PLAYERS);

        await User.create({
            username: login,
            name: name || login
        });

        existingUser = await User.findBy('username', login);
    }

    existingUser.merge({
        push_token: pushToken
    });

    if (login) {
        existingUser.merge({
            repos_quantity: public_repos,
            image_url: avatar_url,
            github_etag: etag
        });
    }

    await existingUser.save();

    if (pushToken) {
        await User.query().where('push_token', pushToken).whereNot('id', existingUser.id).update({ push_token: null })
    }

    return {
        id: existingUser.id,
        login: existingUser.username,
        name: existingUser.name,
        avatar: existingUser.image_url,
        repos: existingUser.repos_quantity,
        score: existingUser.score,
        wins: existingUser.wins,
        losses: existingUser.losses,
        ties: existingUser.ties
    }
}

/**
 * Safe sets the socketId of userId
 *
 * @param {integer} userId
 * @param {string} socketId
*/
module.exports.setUserSocketId = async (userId, socketId) => {
    const user = await User.findBy('id', userId);

    user.merge({
        socket_id: socketId
    });

    user.save();
}

/**
 * Get user by id
 *
 * @param {string} userId
*/
module.exports.getUserById = async (userId) => {
    const user = await User.findBy('id', userId);
    return user;
}

/**
 * Get user by email
 *
 * @param {string} email
*/
module.exports.getUserByEmail = async (email) => {
    const user = await User.findBy('email', email);
    return user;
}

/**
 * Get user by socketId
 *
 * @param {string} socketId
*/
module.exports.getUserBySocketId = async (socketId) => {
    const user = await User.findBy('socket_id', socketId);
    return user;
}

/**
 * Gets the list of recent users in app
 *
*/
module.exports.getRecentUsers = async () => {
    const users = await Database.table('users').where('type', UserType.USER).orderBy('updated_at', 'desc').limit(10);

    return users.map((user) => {
        return {
            id: user.id,
            name: user.username,
            avatar: user.image_url
        }
    });
}