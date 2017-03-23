/* jshint esversion: 6 */
var $ = function(q) {
  return document.querySelector(q);
};

// let's generate a random portfolio

var RUNS = 10000;

async function newPortfolio() {
  await blakley.New(plaintextPortfolio);
}

function performanceTestNew() {
  a = new Date();
  for(var i = 0; i < RUNS; i++) {
    var plaintextPortfolio = blakley.generateRandomPortfolio(numberOfGroups, numberOfImagesPerGroup, portfolioSize);
    newPortfolio();

  }
  b = new Date();
  $("#log").innerHTML += "<p class=\"passed\"> "+
    "Generating "+i+" portfolios took <i>"+(b-a)/1000+"</i>s ("+(b-a)/RUNS+"ms per run).</p>";
}

async function verifyPortfolio(userInput, portfolio) {
  await blakley.verify(userInput, portfolio);
}

function performanceTestVerify() {
  // let's generate a random portfolio
  plaintextPortfolio = blakley.generateRandomPortfolio(numberOfGroups, numberOfImagesPerGroup, portfolioSize);
  blakley.New(plaintextPortfolio).then(function(portfolio) {
    // generating correct user input ;)
    var userInput = blakley.randomSampleArray(plaintextPortfolio).slice(0, t);
    a = new Date();
    for(var i = 0; i < RUNS; i++) {
      verifyPortfolio(userInput, portfolio);
    }
    b = new Date();
    $("#log").innerHTML += "<p class=\"passed\"> "+
      "Verifying "+i+" portfolios took <i>"+(b-a)/1000+"</i>s ("+(b-a)/RUNS+"ms per run).</p>";
  });

}
