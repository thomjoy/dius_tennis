import Match from './Match';

describe('A Tennis Match', () => {
  it('can be instantiated without error', () => {
    const match = new Match('player one', 'player two')
    expect(match).toBeDefined()
  })

  it('will throw errors if parameters are missing', () => {
    expect(() => { const match = new Match('player one')}).toThrow(Error)
  })

  it('will report the score correctly before a match starts', () => {
    const match = new Match('player one', 'player two')
    const SCORE_AT_START_OF_MATCH = '0-0 0-0'

    expect(match.score()).toBe(SCORE_AT_START_OF_MATCH)
  })

  it('will correctly report a single point won by player one', () => {
    const match = new Match('player one', 'player two')
    match.pointWonBy('player one')
    expect(match.score()).toBe("0-0 15-0")
  })

  it('will correctly report a single point won by player one and player two', () => {
    const match = new Match('player one', 'player two')
    match.pointWonBy('player one')
    match.pointWonBy('player two')
    expect(match.score()).toBe("0-0 15-15")
  })

  it('will correctly report multiple points won by a player one in a row', () => {
    const match = new Match('player one', 'player two')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    expect(match.score()).toBe("0-0 30-0")
  })

  it('will correctly reach game point by player one', () => {
    const match = new Match('player one', 'player two')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    expect(match.score()).toBe("0-0 40-0")
  })

  it('will correctly report a game won by player one', () => {
    const match = new Match('player one', 'player two')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    expect(match.score()).toBe("1-0 0-0")
  })

  it('will correctly report that "Deuce" has been reached after both players reach 40 points', () => {
    const match = new Match('player one', 'player two')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    match.pointWonBy('player two')
    match.pointWonBy('player two')
    match.pointWonBy('player two')
    expect(match.score()).toBe("0-0 Deuce")
  })

  it('will correctly report that Player One has the advantage', () => {
    const match = new Match('player one', 'player two')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    match.pointWonBy('player two')
    match.pointWonBy('player two')
    match.pointWonBy('player two') // Deuce

    match.pointWonBy('player one') // Advantage
    expect(match.score()).toBe("0-0 Advantage player one")
  })

  it('will correctly report that the score is Deuce, after player one loses the advantage', () => {
    const match = new Match('player one', 'player two')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    match.pointWonBy('player two')
    match.pointWonBy('player two')
    match.pointWonBy('player two') // Deuce

    match.pointWonBy('player one') // Advantage player one
    match.pointWonBy('player two') // Deuce, again
    expect(match.score()).toBe("0-0 Deuce")
  })

  it('will correctly report that Player One has won the game after Deuce', () => {
    const match = new Match('player one', 'player two')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    match.pointWonBy('player one')
    match.pointWonBy('player two')
    match.pointWonBy('player two')
    match.pointWonBy('player two') // Deuce

    match.pointWonBy('player one') // Advantage player one
    match.pointWonBy('player one') // Game player one
    expect(match.score()).toBe("1-0 0-0")
  })

  it('will correctly shift into tiebreak mode when both players have won six games each', () => {
    const fakeGamesWon = {'player one': 6, 'player two': 5}
    const fakeCurrentScore = {'player one': 0, 'player two': 3}
    const match = new Match('player one', 'player two', fakeGamesWon, fakeCurrentScore)

    expect(match.score()).toBe("6-5 0-40")

    match.pointWonBy('player two')
    expect(match.score()).toBe("6-6 0-0")

    match.pointWonBy('player one')
    expect(match.currentScoringMode).toEqual('TIEBREAK')
  })

  it('will correctly win a game on match point', () => {
    const fakeGamesWon = {'player one': 5, 'player two': 4}
    const fakeCurrentScore = {'player one': 3, 'player two': 0}
    const match = new Match('player one', 'player two', fakeGamesWon, fakeCurrentScore)

    expect(match.score()).toBe("5-4 40-0") // Match Point
    match.pointWonBy('player one')
    expect(match.score()).toBe("6-4 0-0")
    expect(match.MATCH_WON).toBe(true)
  })

  it('will use tiebreak scoring when the score is 6-6', () => {
    const fakeGamesWon = {'player one': 6, 'player two': 6}
    const fakeCurrentScore = {'player one': 0, 'player two': 0}
    const match = new Match('player one', 'player two', fakeGamesWon, fakeCurrentScore)

    expect(match.score()).toBe("6-6 0-0")

    match.pointWonBy('player one')
    expect(match.score()).toBe("6-6 1-0")
    expect(match.currentScoringMode).toEqual('TIEBREAK')
  })

  it('will correctly report tiebreak scores', () => {
    const fakeGamesWon = {'player one': 6, 'player two': 6}
    const fakeCurrentScore = {'player one': 0, 'player two': 0}
    const match = new Match('player one', 'player two', fakeGamesWon, fakeCurrentScore)
    
    match.pointWonBy('player one')
    expect(match.currentScoringMode).toEqual('TIEBREAK')
    expect(match.score()).toBe("6-6 1-0")

    match.pointWonBy('player two')
    match.pointWonBy('player two')
    expect(match.score()).toBe("6-6 1-2")
  })

  it('will correctly continue a tiebreak after both players have 7 points', () => {
    const fakeGamesWon = {'player one': 6, 'player two': 6}
    const fakeCurrentScore = {'player one': 6, 'player two': 6}
    const match = new Match('player one', 'player two', fakeGamesWon, fakeCurrentScore)
    
    match.pointWonBy('player one')
    expect(match.currentScoringMode).toEqual('TIEBREAK')
    expect(match.score()).toBe("6-6 7-6")

    match.pointWonBy('player two')
    expect(match.score()).toBe("6-6 7-7")

    match.pointWonBy('player two')
    expect(match.score()).toBe("6-6 7-8")
  })

  it('will correctly win matches that end in tiebreaks', () => {
    const fakeGamesWon = {'player one': 6, 'player two': 6}
    const fakeCurrentScore = {'player one': 6, 'player two': 6}
    const match = new Match('player one', 'player two', fakeGamesWon, fakeCurrentScore)
    
    match.pointWonBy('player one')
    expect(match.currentScoringMode).toEqual('TIEBREAK')
    expect(match.score()).toBe("6-6 7-6")

    match.pointWonBy('player one')
    expect(match.MATCH_WON).toBe(true)
    expect(match.score()).toBe("7-6 0-0")
  })

  it('will correctly win matches that go beyond 7 points in tiebreaks', () => {
    const fakeGamesWon = {'player one': 6, 'player two': 6}
    const fakeCurrentScore = {'player one': 7, 'player two': 7}
    const match = new Match('player one', 'player two', fakeGamesWon, fakeCurrentScore)
    
    match.pointWonBy('player one')
    expect(match.currentScoringMode).toEqual('TIEBREAK')
    expect(match.score()).toBe("6-6 8-7")

    match.pointWonBy('player one')
    expect(match.MATCH_WON).toBe(true)
    expect(match.score()).toBe("7-6 0-0")
  })
})
