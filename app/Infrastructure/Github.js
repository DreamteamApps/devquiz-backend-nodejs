const axios = require('axios');

/**
 * Get user public github information
 *
 * @param {string} username
*/
module.exports.getUserInformation = async (username, etag) => {
    try {
        const githubClientId = process.env.GITHUB_CLIENT_ID;
        const githubSecret = process.env.GITHUB_SECRET;

        const options = {
            validateStatus: function (status) {
                return status < 400;
            }
        }

        if (githubClientId && githubSecret) {
            options.auth = {
                username: githubClientId,
                password: githubSecret
            }
        }

        if (etag) {
            options.headers = {
                ["If-None-Match"]: etag
            }
        }

        const response = await axios.get(`https://api.github.com/users/${username}`, options);

        return {
            ...response.data,
            etag: response.headers['etag']
        };
    } catch (ex) {
        return {};
    }
}