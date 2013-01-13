package bingo

class Game {
    String meetingName
    String board
    String playerName
    static constraints = {
        board type: 'text', nullable: true, maxSize: 15000
        playerName nullable: true
    }
}
