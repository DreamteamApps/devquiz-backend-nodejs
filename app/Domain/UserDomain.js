/**
 * Repository
 * 
*/
const UserRepository = use('App/Repository/UserRepository')

/**
 * Domain
 * 
*/
const StatisticsDomain = use('App/Domain/StatisticsDomain')

/** DTO **/
const DTOUser = use('App/DTO/DTOUser')

/** General **/
const GitHub = use("App/Infrastructure/Github")
const StatisticsType = use('App/Enum/StatisticsType')

/**
 * Gets a user in github, create it or update in our database and return it
 *
 * @param {string} githubUser
 * @param {string} pushToken
*/
module.exports.getOrCreateUser = async (githubUser, pushToken) => {
    let existingUser = await UserRepository.getUserByUsername(githubUser);

    const { login, name, public_repos, avatar_url, etag } = await GitHub.getUserInformation(githubUser, existingUser && existingUser.github_etag);

    if (!login && !existingUser) {
        return {
            "errorCode": 1,
            "message": "This user doesn't exists!"
        }
    }
    
    if (!existingUser) {
        StatisticsDomain.increaseStatisticsValue(StatisticsType.TOTAL_PLAYERS);

        existingUser = await UserRepository.create({
            username: login,
            name: name || login
        });
    }

    existingUser.push_token = pushToken;

    if (login) {
        existingUser.repos_quantity = public_repos;
        existingUser.image_url = avatar_url;
        existingUser.github_etag = etag;
    }

    await UserRepository.update(existingUser);

    if (pushToken) {
        await UserRepository.removePushTokenFromOtherUsers(pushToken, existingUser.id);
    }

    const dtoUser = new DTOUser(existingUser);

    return dtoUser;
}

/**
 * Safe sets the socketId of userId
 *
 * @param {integer} userId
 * @param {string} socketId
*/
module.exports.setUserSocketId = async (userId, socketId) => {
    await UserRepository.update({
        id: userId,
        socket_id: socketId
    });
}

/**
 * Get user by id
 *
 * @param {string} userId
*/
module.exports.getUserById = async (userId) => {
    const user = await UserRepository.getUserById(userId);

    const dtoUser = new DTOUser(user);

    return dtoUser;
}

/**
 * Get user by email
 *
 * @param {string} email
*/
module.exports.getUserByEmail = async (email) => {
    const user = await UserRepository.getUserByEmail(email);

    const dtoUser = new DTOUser(user);

    return dtoUser;
}

/**
 * Get user by socketId
 *
 * @param {string} socketId
*/
module.exports.getUserBySocketId = async (socketId) => {
    const user = await UserRepository.getUserBySocketId(socketId);

    const dtoUser = new DTOUser(user);

    return dtoUser;
}

/**
 * Gets the list of recent users in app
 *
*/
module.exports.getRecentUsers = async () => {
    const recentPlayers = await UserRepository.getRecentPlayers();

    const result = recentPlayers.map(player => new DTOUser(player));

    return result;
}