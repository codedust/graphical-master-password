/*jshint esversion: 6 */
(function(){
  var portfolio = loadPortfolio();

  function shuffleArray(arr) {
    // Durstenfeld shuffle algorithm
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }

    return arr;
  }

  function createPortfolio() {
    return new Promise(function(resolve, reject){
      blakley.New().then(function(newPortfolio) {
        portfolio = newPortfolio;
        resolve(portfolio);
      });
    });
  }

  function portfolioInitialized() {
    return (portfolio && portfolio.groups && portfolio.groups.length > 0);
  }


  // this function saves a portfolio to the browsers localStorage
  //
  // Since localStorage does not handle the prototype (object type) of BigInteger
  // objects correctly, we have to store them as strings and convert them back
  // when the data is read again.
  // We also only store the data we need to retrieve the shared secret when
  // the user enters a correct password
  function savePortfolio() {
    // we can now safely delete the plaintext information that we *must* not
    // store
    portfolio.passwordPortfolio = null;

    // we have to convert BigIntegers to strings since localStorage is not
    // capable of correctly handling the prototype (object type) of the objects
    var sPortfolio = {};
    var sM = [];
    for (var i = 0; i < portfolio.M.length; i++) {
      var coefficients = [];
      for (var j = 0; j < portfolio.M[i].length; j++) {
        coefficients.push(portfolio.M[i][j].toString());
      }
      sM.push(coefficients);
    }
    sPortfolio.M = sM;
    sPortfolio.groups = portfolio.groups;
    sPortfolio.hashed_secret = portfolio.hashed_secret.toString();
    sPortfolio.salt = portfolio.salt.toString();
    sPortfolio.p = portfolio.p.toString();

    console.log("Saving portfolio to localStorage...");
    localStorage.setItem('portfolio', JSON.stringify(sPortfolio));
  }

  // this function loades a portfolio from the browsers localStorage
  function loadPortfolio() {
    console.log("Loading portfolio from localStorage...");
    var sPortfolio = JSON.parse(localStorage.getItem('portfolio')) || null;
    if (sPortfolio === null) {
      return null;
    }

    // convert the stored strings to BigIntegers
    var portfolio = {};
    var M = [];
    for (var i = 0; i < sPortfolio.M.length; i++) {
      var coefficients = [];
      for (var j = 0; j < sPortfolio.M[i].length; j++) {
        coefficients.push(new BigInteger(sPortfolio.M[i][j]));
      }
      M.push(coefficients);
    }
    portfolio.M = M;
    portfolio.groups = sPortfolio.groups;
    portfolio.hashed_secret = new BigInteger(sPortfolio.hashed_secret);
    portfolio.salt = new BigInteger(sPortfolio.salt);
    portfolio.p = new BigInteger(sPortfolio.p);

    return portfolio;
  }

  // this function deletes the portfolio from the browsers localStorage
  function removePortfolio() {
    portfolio = null;
    localStorage.removeItem('portfolio');
  }

  function getRandomizedCollectionIds() {
    var collectionIds = portfolio.groups.slice();
    shuffleArray(collectionIds);
    return collectionIds;
  }

  function getRandomizedCollectionItemIds(collectionId) {
    var itemIds = Array.apply(null, {length: Config.NUM_ITEMS_PER_COLLECTION}).map(Number.call, Number);
    // TODO: DEBUG/TEMPORARY
    //shuffleArray(itemIds);
    return itemIds;
  }

  // checks whether the input supplied by the user matches a valid password variation.
  //
  // this function takes the following arguments:
  // - collectionIds: this array contains the IDs of the galleries (image groups).
  // - itemIds: this array contains CORRESPONDING IDs that make up the password.
  //
  // the collections are "linked", e.g. itemIds[3] corresponds to collectionIds[3]
  function getIsValidLoginCombination(collectionIds, itemIds) {
    return new Promise(function(resolve, reject){
      if (!collectionIds || !itemIds || collectionIds.length != Config.NUM_STEPS_PER_LOGIN || itemIds.length != Config.NUM_STEPS_PER_LOGIN) {
        reject();
      }

      var userInput = [];
      for (var i = 0; i < collectionIds.length; i++) {
        userInput.push([collectionIds[i], itemIds[i]]);
      }
      userInput = userInput.map(
        e => [parseInt(e[0].toString()), parseInt(e[1].toString())]);

      if (portfolio.passwordPortfolio) {
        console.log("WARNING: plaintext passwordPortfolio is still stored in the portfolio");
      }

      blakley.verify(userInput, portfolio).then(function(secret) {
        console.log("verified correctly", secret.toString());
        resolve(secret);
      }, function() {
        console.log("could not verify");
        reject();
      });
    });
  }


  PassMan = {
    createPortfolio: createPortfolio,
    portfolioInitialized: portfolioInitialized,
    savePortfolio: savePortfolio,
    removePortfolio: removePortfolio,
    getRandomizedCollectionIds: getRandomizedCollectionIds,
    getRandomizedCollectionItemIds: getRandomizedCollectionItemIds,
    getIsValidLoginCombination: getIsValidLoginCombination
  };
})();
