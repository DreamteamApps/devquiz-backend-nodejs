const axios = require('axios');

const Log = use("App/Helpers/Log");

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
        } else {
            Log.devLog(`Missing Github Oauth client id or secret`);
        }

        if (etag) {
            options.headers = {
                ["If-None-Match"]: etag
            }
        }

        const response = await axios.get(`https://api.github.com/users/${username}`, options);
        const { data } = response;

        Log.devLog(`Get github user info success`, data);

        return {
            ...data,
            etag: response.headers['etag']
        };
    } catch (ex) {
        Log.devLog(`Get github user info failed`, {
            username,
            error: ex.response
        });
        
        return {};
    }
}