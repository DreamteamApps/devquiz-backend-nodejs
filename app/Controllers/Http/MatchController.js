'use strict'

/**
 * Domain
 * 
*/
const MatchDomain = use('App/Domain/MatchDomain')

class MatchController {

  /**
   * Create a new match for the user.
   * POST matches
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const { userId, opponentId } = request.only(['userId', 'opponentId']);

    const result = await MatchDomain.createMatch(userId, opponentId);

    if (!result.errorCode) {
      return result;
    }

    return response.status(400).send(result);
  }

  /**
   * Joins a user in a match using matchCode
   * POST matches
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async joinMatchWithCode({ request, response }) {
    const { matchCode, userId } = request.only(['matchCode', 'userId']);

    const result = await MatchDomain.joinMatchWithCode(matchCode, userId);

    if (!result.errorCode) {
      return result;
    }

    return response.status(400).send(result);
  }
}

module.exports = MatchController
