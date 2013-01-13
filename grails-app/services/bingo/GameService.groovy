package bingo

class GameService {
    def phrases = ['quick win',
            'tactical\n solution',
            'resources',
            'budget',
            'patch',
            'QA',
            'delivery',
            'scrum',
            'agile',
            'release',
            'short term',
            'merge\n conflict',
            'rebase',
            'stream',
            'POM',
            'clear case',
            'platform',
            'quality',
            'sprint',
            'product\n owner',
            'scrum\n master',
            'specs',
            'strategic',
            'build',
            'blocking']

    def randomFeed() {
        def tempArray = phrases.clone()
        def randomFeedArray =[]
        phrases.each {
            Random rand = new Random()
            def max = tempArray.size()
            def randomIndex = rand.nextInt(max)
            randomFeedArray.add([label:tempArray[randomIndex], selected:false])
            tempArray.remove(randomIndex);
        }

        return randomFeedArray;
    };

    def serviceMethod() {

    }
}
