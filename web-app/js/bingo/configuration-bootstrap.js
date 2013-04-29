var bingo = bingo || {};

bingo.loadConfiguration = (function () {
    bingo.configuration = {
        //baseURL: "http://localhost:8080/bullshitbingo/",
        //applicationContext: "bullshitbingo/",
        //Uncomment before pushing to cloudfoundry
        baseURL: "http://bullshitbingo.cloudfoundry.com/",
        applicationContext: "",
        namespace: "bingo",
        domain:[]
    };
})();

