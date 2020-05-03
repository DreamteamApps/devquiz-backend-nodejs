const axios = require('axios');

const Log = use("App/Helpers/Log");

const oneSignalApiUrl = 'https://onesignal.com/api/v1/notifications';
/**
 * Sends a push notification to One Signal Api
 *
 * @param {Array<string>} playerIds
 * @param {Object} message
*/
module.exports.sendPush = async (playerIds, message) => {
    let pushToSend;

    try {
        if (!playerIds || playerIds.length == 0 || !message || !message.message) {
            return;
        }

        const oneSignalAppId = process.env.ONESIGNAL_API_ID;
        const oneSignalApikey = process.env.ONESIGNAL_API_KEY;
        if (!oneSignalAppId || !oneSignalApikey) {
            Log.devLog(`Missing Onesignal app id or api key`);
            return;
        }

        const options = {
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${oneSignalApikey}`
            }
        }

        pushToSend = {
            app_id: `${oneSignalAppId}`,
            contents: { "en": message.message, "pt": message.message },
            include_player_ids: playerIds,
        };

        if (message.title) {
            pushToSend.headings = { "en": message.title, "pt": message.title };
        }

        if (message.data) {
            pushToSend.data = message.data;
        }

        if (message.buttons) {
            pushToSend.buttons = message.buttons;
        }

        await axios.post(oneSignalApiUrl, pushToSend, options);

        Log.devLog(`Sending push notification success`, pushToSend);
    } catch (ex) {
        Log.devLog(`Sending push notification failed`, {
            push: pushToSend,
            error: ex.response
        });
    }
}