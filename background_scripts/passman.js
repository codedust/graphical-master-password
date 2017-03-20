/*jshint esversion: 6 */
(function(){
  var portfolio = loadPortfolio();
  var self = {};
  self.secret = null;

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
        console.log(newPortfolio);
        portfolio = newPortfolio;
        portfolio.setupComplete = false;
        self.secret = null;
        resolve(portfolio);
      });
    });
  }

  function getPortfolio() {
    if (!portfolioInitialized() || setupComplete()) {
      return null;
    } else {
      return portfolio;
    }
  }

  function portfolioInitialized() {
    return (portfolio && portfolio.groups && portfolio.groups.length > 0);
  }

  function setupComplete() {
    return (portfolioInitialized() && portfolio.setupComplete);
  }

  function loginSuccessful() {
    console.log("loginSuccessful", self.secret);
    return (setupComplete() && self.secret !== null);
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
          console.log("passwd", data[i]);
          var currentLogin = data[i];
          var promise = encryptPassword(currentLogin, self.secret).then(result => {
            console.log("encrypted", result);
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
          console.log("passwd", data[i]);
          var currentLogin = data[i];
          var promise = decryptPassword(currentLogin, self.secret).then(result => {
            console.log("unencrypted", result);
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
    encryptPasswords().then(function() {
      console.log('setting secret to null');
      self.secret = null;
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
    portfolio.setupComplete = true;

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
    portfolio.setupComplete = true; // we never store plaintext data!

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
      if (!userInput || userInput.length != Config.NUM_STEPS_PER_LOGIN) {
        reject();
      }

      if (portfolio.passwordPortfolio) {
        console.log("WARNING: plaintext passwordPortfolio is still stored in the portfolio");
      }

      blakley.verify(userInput, portfolio).then(function(blakley_secret) {
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
    getPortfolio: getPortfolio,
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
