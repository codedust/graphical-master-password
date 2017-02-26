/*jshint esversion: 6 */
(function(){
  var availableCollectionIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
  var availableItemIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];

  var portfolio = getStoredPortfolio();

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
      if (Config.NUM_STEPS_PER_LOGIN === 4 && Config.NUM_PASSWORD_PARTS === 10) {
        resolve(createPortfolio());
      }

      blakley.New().then(function(newPortfolio) {
        portfolio = newPortfolio;

        portfolio.collectionIds = newPortfolio.groups;
        portfolio.itemIds = newPortfolio.passwordPortfolio.map(e => e[1].toString());
        resolve(portfolio);
      });
    });
  }

  function portfolioInitialized() {
    return (portfolio && portfolio.collectionIds && portfolio.collectionIds.length > 0);
  }

  // At this point, we have two arrays with password data:
  //
  // - portfolio.collectionIds: This array contains the IDs of the galleries (ID = relative path name).
  // - portfolio.itemIds: This array contains CORRESPONDING IDs that make up the password (ID = filename without extension)
  //
  // "Corresponding" means that the index of the gallery and the index of the item match. E.g., if image "5" from gallery "7"
  // and image "6" of gallery "9" were assigned to the user as a password, these arrays would like this:
  //
  // - portfolio.collectionIds = ["7", "9"] (actual length == Config.NUM_STEPS_PER_LOGIN)
  // - portfolio.itemIds = ["5", "6"] (actual length == Config.NUM_PASSWORD_PARTS)
  //
  // Please note that while currently all IDs are numbers, these might as well be strings. Adjust the following so that it saves
  // the encrypted password information according to your needs. Currently, the password is saved in clear text.
  function savePortfolio() {
    if (Config.NUM_STEPS_PER_LOGIN === 4 && Config.NUM_PASSWORD_PARTS === 10) {
      savePortfolio1004(portfolio.collectionIds, portfolio.itemIds);
      return;
    }

    // we don't store the password portfolio in cleartext
    portfolio.passwordPortfolio = null;
    portfolio.itemIds = null;

    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }

  function removePortfolio() {
    portfolio = {
      collectionIds: [],
      itemIds: []
    };

    localStorage.removeItem('portfolio');
  }

  function getRandomizedCollectionIds() {
    var collectionIds = portfolio.collectionIds.slice();
    shuffleArray(collectionIds);
    return collectionIds;
  }

  function getRandomizedCollectionItemIds(collectionId) {
    // DEBUG/TEMPORARY
    return availableItemIds;

    // Right now all collections use the same item IDs. Thus, collectionId is ignored.
    var itemIds = availableItemIds.slice();
    shuffleArray(itemIds);
    return itemIds;
  }

  // Checks whether the input supplied by the user matches a valid password variation.
  //
  // The user has supplied the following data:
  //
  // - collectionIds: This array contains the IDs of the galleries (ID = relative path name).
  // - itemIds: This array contains CORRESPONDING IDs that make up the password (ID = filename without extension).
  //
  // The collections are linked, e.g. itemIds[3] corresponds to collectionIds[3]. See comments in savePortfolio() for more details for the
  // data stored inside the arrays.
  function getIsValidLoginCombination(collectionIds, itemIds) {
    return new Promise(function(resolve, reject){
      if (!collectionIds || !itemIds || collectionIds.length != Config.NUM_STEPS_PER_LOGIN || itemIds.length != Config.NUM_STEPS_PER_LOGIN) {
        reject();
      }

      if (Config.NUM_STEPS_PER_LOGIN === 4 && Config.NUM_PASSWORD_PARTS === 10) {
        if (getIsValidLoginCombination1004(collectionIds, itemIds)) {
          resolve();
        } else {
          reject();
        }
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

  function getStoredPortfolio() {
    var portfolio = JSON.parse(localStorage.getItem('portfolio')) || null;
    return portfolio;
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
