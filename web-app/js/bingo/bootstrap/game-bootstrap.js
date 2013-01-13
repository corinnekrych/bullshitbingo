var bingo = bingo || {};

bingo.loadgame = (function () {
    bingo.configuration.domain.push({
        name: 'game',
        view: {
            'list': $('#section-list-game'),
            'save': $('#submit-game'),
            'add': $('#add-game'),
            'show': $('a[id^="game-list-"]'),
            'remove': $('#delete-game')
        },
        options: {
            offline: false,
            eventPush: true
        }
    });
}());
