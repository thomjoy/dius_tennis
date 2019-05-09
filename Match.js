export default class Match {
  constructor(player1, player2, gamesWon, scoreInCurrentGame) {
    this.players = [player1, player2]
    if (! player1 || ! player2) { throw new Error('A Tennis match needs at least two players') }

    // only one set in this match of tennis, so just tally the games won
    // my justification for passing 'gamesWon' and/or scoreInCurrentGame is to account for
    // when a match spans multiple days and needs to be restarted with some previous score.
    this.gamesWon = gamesWon || {
      'player one': 0,
      'player two': 0,
    }

    // keep track of the score of the current game being played via a points won metric
    // we will map "Points Won" to "Score" below
    this.scoreInCurrentGame = scoreInCurrentGame || {
      'player one': 0,
      'player two': 0,
    }

    // keys are ascending integers for ease of internal use
    // values are human readable scores as per the rules of tennis
    this.scoreMap = new Map([
      [0, '0'],
      [1, '15'],
      [2, '30'],
      [3, '40'],
      [4, 'Advantage'],
      [5, 'Game'],
    ])

    this.scoringModes = { REGULAR: 'REGULAR', TIEBREAK: 'TIEBREAK' };
    this.currentScoringMode = this.scoringModes.REGULAR

    this.MATCH_WON = false
  }

  // utility method to return keys based on a string
  // hacky, but for two players is fine
  getPlayerKeys(player) {
    const scoringPlayer = player === 'player one' ? 'player one' : 'player two'
    const nonScoringPlayer = player === 'player one' ? 'player two' : 'player one'
    return { scoringPlayer, nonScoringPlayer }
  }

  // Returns a boolean to indicate if the game has been won on this point
  calculatePoint(scoringPlayer, nonScoringPlayer) {
    let scoringDone = false
    let GAME_WON = false

    while (! scoringDone) {
      // We'll take care of special case scores first.
      // Check if the score is _at least_ 40-40 (Deuce)
      const isScoreAtLeastDeuce = this.scoreInCurrentGame[scoringPlayer] >= 3
                                  && this.scoreInCurrentGame[nonScoringPlayer] >= 3
      
      if (isScoreAtLeastDeuce) {
        // case: scoring player is on advantage
        // outcome: scoring player wins the current game
        if (this.scoreInCurrentGame[scoringPlayer] == 4 && this.scoreInCurrentGame[nonScoringPlayer] == 3) {
          this.scoreInCurrentGame[scoringPlayer]++
          GAME_WON = true
        }

        // case: scoring player is on deuce (40-40)
        // outcome: scoring player moves to advantage
        else if (this.scoreInCurrentGame[scoringPlayer] == 3 && this.scoreInCurrentGame[nonScoringPlayer] == 3) {
          this.scoreInCurrentGame[scoringPlayer]++
        }

        // case: scoring player is on 40 and nonScoring player is on advantage
        // outcome: score returns to 40-40 (Deuce)
        else if (this.scoreInCurrentGame[scoringPlayer] == 3 && this.scoreInCurrentGame[nonScoringPlayer] == 4) {
          // also need to decrement nonScoringPlayer back down to 40, from advantage
          this.scoreInCurrentGame[nonScoringPlayer]--
        }
      }

      // case: the scoring player is on 40 the other player is on < 40
      // outcome: the game is won
      else if (this.scoreInCurrentGame[scoringPlayer] === 3) {
        GAME_WON = true
      }

      // all other cases are just a score increment for the scoring player
      else {
        this.scoreInCurrentGame[scoringPlayer]++
      }

      scoringDone = true
    }

    return GAME_WON
  }

  calculateTieBreakPoint(scoringPlayer) {
    // register the point scored
    this.scoreInCurrentGame[scoringPlayer]++
    let GAME_WON = false

    // work out if:
    // at least 7 points have been scored
    const pointsScored = Math.max(this.scoreInCurrentGame['player one'], this.scoreInCurrentGame['player two'])
    if (pointsScored < 7 ) {
      GAME_WON = false
    }
    else {
      // game is won if either player is clear by two points
      GAME_WON = Math.abs(this.scoreInCurrentGame['player one'] - this.scoreInCurrentGame['player two']) >= 2
    }

    return GAME_WON
  }

  updateGamesWon(gameWinningPlayer) {
    // increment the scoringPlayers set score as a result of winning this game
    this.gamesWon[gameWinningPlayer]++
  }

  resetCurrentGameScore() {
    this.scoreInCurrentGame['player one'] = 0
    this.scoreInCurrentGame['player two'] = 0
  }

  pointWonBy(player) {
    const { scoringPlayer, nonScoringPlayer } = this.getPlayerKeys(player)

    // Have both players won six games each (6-6)?
    this.currentScoringMode = (this.gamesWon['player one'] === 6 && this.gamesWon['player two'] === 6)
                                ? this.scoringModes.TIEBREAK
                                : this.scoringModes.REGULAR
   
    const GAME_WON = this.currentScoringMode === this.scoringModes.REGULAR
                      ? this.calculatePoint(scoringPlayer, nonScoringPlayer)
                      : this.calculateTieBreakPoint(scoringPlayer, nonScoringPlayer)

    if (GAME_WON) {
      this.updateGamesWon(scoringPlayer)

      // Work out what happens when a game is won
      const p1GamesWon = this.gamesWon['player one']
      const p2GamesWon = this.gamesWon['player two']

      // What is the current maximum number of games any player has won?
      const maxGamesWon = Math.max(p1GamesWon, p2GamesWon)

      // Do we have a winner due to any player winning 6 games...
      // AND we don't have a tiebreak
      // AND the other player has won four or fewer games? (i.e. margin of two games)
      if (maxGamesWon === 6 && (this.currentScoringMode !== this.scoringModes.TIEBREAK)) {
        this.MATCH_WON = Math.abs(p1GamesWon - p2GamesWon) >= 2
      }

      // If any player has won 7 games, we must have a winner due to tie-break
      if (maxGamesWon === 7) {
        this.MATCH_WON = true
      }

      // We always reset the game score after the the game / match is won.
      this.resetCurrentGameScore()
    }
  }

  resetGameScore() {
    this.scoreInCurrentGame = {
      'player one': 0,
      'player two': 0,
    }
  }

  formatGamesWon(playerOne, playerTwo) {
    return `${this.gamesWon[playerOne]}-${this.gamesWon[playerTwo]}`
  }

  formatGameScore(playerOne, playerTwo, opts) {
    let gameScore
    const p1 = this.scoreInCurrentGame[playerOne]
    const p2 = this.scoreInCurrentGame[playerTwo]

    if (opts && opts.isTieBreak === true) {
      gameScore = `${p1}-${p2}`
    }
    else {
      gameScore = `${this.scoreMap.get(p1)}-${this.scoreMap.get(p2)}`
      
      // handle the special case translations of 40-40, 40-A and A-40
      switch(gameScore) {
        case '40-40':
          gameScore = 'Deuce'
          break
        case 'Advantage-40':
          gameScore = 'Advantage player one'
          break
        case '40-Advantage':
          gameScore = 'Advantage player two'
          break
      }
    }
  
    return gameScore
  }

  score() {
    const scoreInSets = this.formatGamesWon('player one', 'player two')
    let scoreInCurrentGame = this.currentScoringMode === this.scoringModes.REGULAR
                              ? this.formatGameScore('player one', 'player two')
                              : this.formatGameScore('player one', 'player two', {isTieBreak: true})

    return `${scoreInSets} ${scoreInCurrentGame}`
  } 
}

