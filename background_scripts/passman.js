/*jshint esversion: 6 */
(function(){
  var self = {};
  self.secret = null;
  self.plaintextPortfolio = null;
  self.portfolio = loadPortfolio();

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

  function createPortfolio(plaintextPortfolio) {
    return new Promise(function(resolve, reject){
      // let's generate a random portfolio
      if (!(plaintextPortfolio instanceof Array)) {
        plaintextPortfolio = blakley.generateRandomPortfolio(
          Config.NUM_IMAGE_GROUPS,
          Config.NUM_IMAGES_PER_GROUP,
          Config.NUM_IMAGE_GROUPS_PER_PORTFOLIO);
      }

      blakley.New(plaintextPortfolio).then(function(newPortfolio) {
        self.plaintextPortfolio = plaintextPortfolio;
        self.portfolio = newPortfolio;
        self.portfolio.setupComplete = false;
        resolve();
      });
    });
  }

  function getPlaintextPortfolio() {
    return new Promise(function(resolve, reject){
      if (!setupComplete()) {
        console.log("[getPlaintextPortfolio] !setupComplete() -> ", self.plaintextPortfolio);
        resolve(self.plaintextPortfolio);
      } else if (!loginSuccessful()) {
        console.log("[getPlaintextPortfolio] rejecting because user is not logged in and setup is complete.");
        reject();
      } else {
        console.log("[getPlaintextPortfolio] decrypting encryptedPlaintextPortfolio");
        // we add 42 to our secret because hash(secret) is publicly known, but
        // hash(secret + 42) is not
        var secretUint8Array = blakley.bigIntegerToUint8Array(new BigInteger(self.secret).add(42));
        crypto.subtle.digest('SHA-256', secretUint8Array).then(pwHash => {
          var cryptoData = self.portfolio.encryptedPlaintextPortfolio.split('|');
          var ctBuffer = blakley.bigIntegerToUint8Array(new BigInteger(cryptoData[0]));
          var iv = blakley.bigIntegerToUint8Array(new BigInteger(cryptoData[1]));
          var alg = { name: 'AES-GCM', iv: iv };

          crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']).then(key => {
            crypto.subtle.decrypt(alg, key, ctBuffer).then(ctRaw => {
              resolve(JSON.parse(new TextDecoder().decode(ctRaw)));
            });
          });
        });
      }
    });
  }

  function portfolioInitialized() {
    return (self.portfolio && self.portfolio.groups && self.portfolio.groups.length > 0);
  }

  function setupComplete() {
    return (portfolioInitialized() && self.portfolio.setupComplete);
  }

  function loginSuccessful() {
    return (setupComplete() && self.secret !== null);
  }

  function changePortfolioGroup(groupId) {
    return new Promise(function(resolve, reject){
      var index = self.portfolio.groups.indexOf(groupId);
      if (index == -1) {
        reject("changePortfolioGroup: groupId not found in current portfolio.");
        return;
      }

      var newGroupId = groupId;
      while(self.portfolio.groups.indexOf(newGroupId) != -1) {
        newGroupId = blakley.math.getRandomInt(0, Config.NUM_IMAGE_GROUPS - 1).toJSValue();
      }

      getPlaintextPortfolio().then(plaintextPortfolio => {
        plaintextPortfolio[index] = [
          newGroupId, blakley.math.getRandomInt(0, Config.NUM_IMAGES_PER_GROUP - 1).toJSValue()
        ];

        createPortfolio(plaintextPortfolio).then(function() {
          savePortfolio();
          validateUserInput(plaintextPortfolio.slice(0, Config.NUM_IMAGE_GROUPS_PER_LOGIN)).then(function(){
            resolve(plaintextPortfolio);
          }, function () {
            reject("changePortfolioGroup: validateUserInput failed");
          });
        });
      });
    });
  }



  var blakleyPasswordPrefix = "---blakley-encrypted---";

  // this function decrypts a single password
  //
  function decryptPassword(login, secret) {
    return new Promise(function(resolve, reject){
      var cryptoData = login.password.split('|');
      if (cryptoData[0] != blakleyPasswordPrefix) {
        resolve({login: login, cleartext: login.password}); // password is not encrypted
      }

      // we add 42 to our secret because hash(secret) is publicly known, but
      // hash(secret + 42) is not
      var secretUint8Array = blakley.bigIntegerToUint8Array(new BigInteger(secret).add(42));
      crypto.subtle.digest('SHA-256', secretUint8Array).then(pwHash => {
        var ctBuffer = blakley.bigIntegerToUint8Array(new BigInteger(cryptoData[1]));
        var iv = blakley.bigIntegerToUint8Array(new BigInteger(cryptoData[2]));
        var alg = { name: 'AES-GCM', iv: iv };

        crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']).then(key => {
          crypto.subtle.decrypt(alg, key, ctBuffer).then(ctRaw => {
            var pwRaw = new TextDecoder().decode(ctRaw);
            resolve({login: login, cleartext: pwRaw});
          });
        });
      });
    });
  }


  // this function encrypts a single password
  //
  function encryptPassword(login, secret) {
    return new Promise(function(resolve, reject){
      if (login.password.split('|')[0] == blakleyPasswordPrefix) {
        resolve({login: login, password: login.password}); // don't encrypt twice
      }

      const ptUtf8 = new TextEncoder().encode(login.password);

      // we add 42 to our secret because hash(secret) is publicly known, but
      // hash(secret + 42) is not
      var secretUint8Array = blakley.bigIntegerToUint8Array(new BigInteger(secret).add(42));
      crypto.subtle.digest('SHA-256', secretUint8Array).then(pwHash => {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const alg = { name: 'AES-GCM', iv: iv };
        crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']).then(key => {
          crypto.subtle.encrypt(alg, key, ptUtf8).then(ctBuffer => {
            var ctBufferBig = blakley.uint8ArrayToBigInteger(new Uint8Array(ctBuffer));
            var ivBig = blakley.uint8ArrayToBigInteger(iv);

            var cryptoString = blakleyPasswordPrefix + "|" + ctBufferBig.toString() + "|" + ivBig.toString();
            resolve({login: login, password: cryptoString});
          });
        });
      });
    });
  }


  // this function encrypts all passwords in the browsers password store so that
  // they cannot be accessed by any 3th party without retrieving the shared
  // secret
  //
  function encryptPasswords() {
    if (!loginSuccessful()) {
      throw new Error("Passwords could not be encrypted because login was not successful!");
    }

    return new Promise(function(resolve, reject) {
      var promises = [];

      browser.logins.search({}).then(function(data) {
        for (var i = 0; i < data.length; i++) {
          var currentLogin = data[i];
          var promise = encryptPassword(currentLogin, self.secret).then(result => {
            currentLogin = result.login;
            browser.logins.remove(currentLogin);
            currentLogin.username = blakleyPasswordPrefix + currentLogin.username.replace(blakleyPasswordPrefix, '');
            currentLogin.password = result.password;
            browser.logins.store(currentLogin);
          });
          promises.push(promise);
        }

        Promise.all(promises).then(() => {
          resolve();
        });
      });
    });
  }

  function decryptPasswords() {
    if (!loginSuccessful()) {
      throw new Error("Passwords could not be encrypted because login was not successful!");
    }

    return new Promise(function(resolve, reject) {
      var promises = [];

      browser.logins.search({}).then(function(data) {
        for (var i = 0; i < data.length; i++) {
          var currentLogin = data[i];
          var promise = decryptPassword(currentLogin, self.secret).then(result => {
            currentLogin = result.login;
            browser.logins.remove(currentLogin);
            currentLogin.username = blakleyPasswordPrefix + result.login.username.replace(blakleyPasswordPrefix, '');
            currentLogin.password = result.cleartext;
            browser.logins.store(currentLogin);
          });
          promises.push(promise);
        }

        Promise.all(promises).then(() => {
          resolve();
        });
      });
    });
  }


  // encrypts all passwords and deletes the secret
  function logout() {
    return new Promise(function(resolve, reject) {
      encryptPasswords().then(function() {
        console.log('setting secret to null');
        self.secret = null;
        self.plaintextPortfolio = null;
        resolve();
      });
    });
  }


  // this function saves a portfolio to the browsers localStorage
  //
  // Since localStorage does not handle the prototype (object type) of BigInteger
  // objects correctly, we have to store them as strings and convert them back
  // when the data is read again.
  // We also only store the data we need to retrieve the shared secret when
  // the user enters a correct password
  function savePortfolio() {
    // the user has seen the portfolio images (we never store plaintext data!)
    self.portfolio.setupComplete = true;

    // we have to convert BigIntegers to strings since localStorage is not
    // capable of correctly handling the prototype (object type) of the objects
    var sPortfolio = {};
    var sM = [];
    for (var i = 0; i < self.portfolio.M.length; i++) {
      var coefficients = [];
      for (var j = 0; j < self.portfolio.M[i].length; j++) {
        coefficients.push(self.portfolio.M[i][j].toString());
      }
      sM.push(coefficients);
    }
    sPortfolio.M = sM;
    sPortfolio.groups = self.portfolio.groups;
    sPortfolio.hashed_secret = self.portfolio.hashed_secret.toString();
    sPortfolio.salt = self.portfolio.salt.toString();
    sPortfolio.p = self.portfolio.p.toString();
    sPortfolio.encryptedPlaintextPortfolio = self.portfolio.encryptedPlaintextPortfolio;

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
    self.portfolio = {};
    var M = [];
    for (var i = 0; i < sPortfolio.M.length; i++) {
      var coefficients = [];
      for (var j = 0; j < sPortfolio.M[i].length; j++) {
        coefficients.push(new BigInteger(sPortfolio.M[i][j]));
      }
      M.push(coefficients);
    }
    self.portfolio.M = M;
    self.portfolio.groups = sPortfolio.groups;
    self.portfolio.hashed_secret = new BigInteger(sPortfolio.hashed_secret);
    self.portfolio.salt = new BigInteger(sPortfolio.salt);
    self.portfolio.p = new BigInteger(sPortfolio.p);
    self.portfolio.setupComplete = true; // we never store plaintext data!
    self.portfolio.encryptedPlaintextPortfolio = sPortfolio.encryptedPlaintextPortfolio;

    return self.portfolio;
  }

  // this function deletes the portfolio from the browsers localStorage
  function removePortfolio() {
    self.portfolio = null;
    localStorage.removeItem('portfolio');
  }

  function getRandomizedCollectionIds() {
    var collectionIds = self.portfolio.groups.slice();
    shuffleArray(collectionIds);
    return collectionIds;
  }

  // checks whether the input supplied by the user matches a valid password variation.
  //
  // this function takes the following arguments:
  // - userInput: this array contains the image groups and it's corresponding
  //              image id the user selected, e.g. [[1, 3], [4, 2]] means that
  //              the user selected the 3rd image from the 1st group and the 2nd
  //              image from the 4th group.
  //
  function validateUserInput(userInput) {
    return new Promise(function(resolve, reject){
      if (!userInput || userInput.length != Config.NUM_IMAGE_GROUPS_PER_LOGIN) {
        reject();
      }

      blakley.verify(userInput, self.portfolio).then(function(blakley_secret) {
        self.secret = blakley_secret;
        console.log("verified correctly", self.secret.toString());
        resolve();
      }, function(reason) {
        console.log("could not verify:", reason);
        reject();
      });
    });
  }


  PassMan = {
    createPortfolio: createPortfolio,
    changePortfolioGroup: changePortfolioGroup,
    getPlaintextPortfolio: getPlaintextPortfolio,
    portfolioInitialized: portfolioInitialized,
    setupComplete: setupComplete,
    loginSuccessful: loginSuccessful,
    logout: logout,
    decryptPasswords: decryptPasswords,
    savePortfolio: savePortfolio,
    removePortfolio: removePortfolio,
    getRandomizedCollectionIds: getRandomizedCollectionIds,
    validateUserInput: validateUserInput
  };
})();
