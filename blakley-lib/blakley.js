/*
Blakley (t-n)-threshold-sharing library

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/* jshint esversion: 6 */
var blakley = (function() {
  var self = {};
  self.math = {};

  numberOfGroups = 19;         // the number of image groups
  numberOfImagesPerGroup = 16; // the number of images in each group
  portfolioSize = 10;          // the number of image groups chosen for the users
                               // portfolio
  authenticationRatio = 2/3;   // The proportion of the portfolio (rounded up) that
                               // has to be entered during each authentication attempt

  // TODO: this should be configurable
  authenticationSize = 5;//Math.ceil(portfolioSize * authenticationRatio);

  t = authenticationSize;
  n = portfolioSize;


  // add modulo method to BigInteger
  BigInteger.prototype.mod = function(p) {
    var n = this;
    while(n.sign() == -1) {
      n = n.add(p);
    }
    return n.remainder(p);
  };

  // assert throws an error if `condition` evaluates to `false`
  function assert(condition, message) {
    if (!condition) {
      message = message || "Assertion failed";
      if (typeof Error !== "undefined") {
        throw new Error(message);
      }
      throw message; // Fallback
    }
  }

  // checks if `n` is prime
  function isPrime(n) {
   if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false;
   if (n%2===0) return (n==2);
   if (n%3===0) return (n==3);
   var m=Math.sqrt(n);
   for (var i=5;i<=m;i+=6) {
    if (n%i===0)     return false;
    if (n%(i+2)===0) return false;
   }
   return true;
  }
  self.math.isPrime = isPrime;

  // returns the next prime number greater than `n`
  function nextPrime(n) {
    do {
      n++;
    } while(!isPrime(n));
    return n;
  }
  self.math.nextPrime = nextPrime;

  // pads the given `str` to `len` characters using the character `ch`
  function leftpad(str, len, ch) {
    if (!ch && ch !== 0) ch = ' ';
    return ('' + ch).repeat(Math.max(0, len - str.length)) + str;
  }
  self.leftpad = leftpad;

  // get a cryptographically secure random number using rejection sampling
  // (see also: <http://en.wikipedia.org/wiki/Rejection_sampling>)
  // the value will be in the closed interval [min, max] (this includes min and max)
  function getRandomInt(min, max) {
    // convert parameters to BigInteger, if neccessary
    if(!(min instanceof BigInteger)) {
      assert(Number.isSafeInteger(min), "Parameter `min` is too large, use BigInteger: "+min);
      min = new BigInteger(min);
    }

    if(!(max instanceof BigInteger)) {
      assert(Number.isSafeInteger(max), "Parameter `max` is too large, use BigInteger: "+max);
      max = new BigInteger(max);
    }

    // retrieve two 32bit secure random numbers
    var byteArray = new Uint32Array(2);
    window.crypto.getRandomValues(byteArray);

    // concat the numbers to retrieve a secure 64bit random number
    var randomValue = new BigInteger("0b" +
      byteArray[0].toString(2) + leftpad(byteArray[1].toString(2), 32, "0"));

    var max_range = new BigInteger('18446744073709551616'); // 2^64
    var range = max.subtract(min).add(1);
    assert(range.compare(max_range) != 1, "[getRandomInteger] (max - min) is too large => "+min.toString()+", "+max.toString());
    if (randomValue.compare(range.multiply(max_range.divide(range))) >= 0) { // mind the implicit Math.floor()
      // rejection
      return getRandomInt(min, max);
    }
    return min.add(randomValue.mod(range));
  }
  self.math.getRandomInt = getRandomInt;

  // randomly shuffle the entries of the given array `arrIn`
  function randomSampleArray(arrIn) {
    var arrOut = [];
    while (arrIn.length > 0) {
      index = getRandomInt(0, arrIn.length - 1);
      arrOut.push(arrIn[index]);
      arrIn.splice(index, 1);
    }
    return arrOut;
  }
  self.randomSampleArray = randomSampleArray;

  // converts a BigInteger to an Uint8Array
  function bigIntegerToUint8Array(bigInteger) {
    var str = bigInteger.toString(16);
    var arr = new Uint8Array(Math.ceil(str.length/2));
    var pos = (str.length & 1)?1:2;

    arr[0] = parseInt(str.substr(0, pos), 16);
    for(var i = 1; pos < str.length; pos += 2) {
      arr[i++] = parseInt(str.substr(pos, 2), 16);
    }
    return arr;
  }
  self.bigIntegerToUint8Array = bigIntegerToUint8Array;

  // converts an Uint8Array to a BigInteger
  function uint8ArrayToBigInteger(array) {
    return new BigInteger(array.reduce((a, b) => a + ((b < 16)?'0':'') + b.toString(16), "0x"));
  }
  self.uint8ArrayToBigInteger = uint8ArrayToBigInteger;

  // determines the number of characters of the decimal representation of `n`
  function integerLength(n) {
    return (n).toString().length;
  }

  // dot product of x and y
  function dot(x, y) {
    assert(x.length == y.length, "[dot] length of x and y did not match");
    var sum = new BigInteger(0);
    for(var i = 0; i < x.length; i++) {
      sum = sum.add(x[i].multiply(y[i]));
    }
    return sum;
  }

  // calculates the reciprocal of n in GF(p) so that n * reciprocal(n, p) == 1
  // using the extended euclidean algorithm
  function reciprocal(n, p) {
    assert(n.isPositive(), "n has to be positive");
    assert(n.compare(p) === -1, "n is larger than p");
    assert(p instanceof BigInteger, "p is not a BigInteger");

    var f = p;
    var g = n;
    var a = new BigInteger(0);
    var b = new BigInteger(1);

    while (!g.isZero()) {
      var h = f.mod(g);
      var c = a.subtract(f.divide(g).multiply(b));
      f = g;
      g = h;
      a = b;
      b = c;
    }
    if (f == 1) {
      return a.add(p).mod(p);
    } else {
      throw "Field size is not prime";
    }
  }
  self.math.reciprocal = reciprocal;

  // the Gauss-Jordan algorithm in the galois field GF(p)
  // this solves the linear equation A.x = B where A == mat, B == vec
  function gauss(mat, vec, p) {
    var pivot = 0;
    var rows = mat.length;
    var columns = mat[0].length;

    // multiply the elements of row `row` by `factor`
    function multiplyRow(row, factor) {
      for (var i = 0; i < columns; i++) {
        mat[row][i] = mat[row][i].multiply(factor).mod(p);
      }
      // also multiply the elements of `vec`
      vec[row] = vec[row].multiply(factor).mod(p);
    }

    // swap the rows `row1` and `row2`
    function swapRows(row1, row2) {
      var temp = mat[row1];
      mat[row1] = mat[row2];
      mat[row2] = temp;

      // also swap the elements of `vec`
      temp = vec[row1];
      vec[row1] = vec[row2];
      vec[row2] = temp;
    }

    // subtract the `factor`s multiplicative of row `refRow` from
    // row `targetRow`
    function subtract_multiply(targetRow, refRow, factor) {
      for(var i = 0; i < columns; i++) {
        mat[targetRow][i] = mat[targetRow][i].subtract(mat[refRow][i].multiply(factor).mod(p)).mod(p);
      }
      // also perform the operation of the vector `vec`
      vec[targetRow] = vec[targetRow].subtract(vec[refRow].multiply(factor).mod(p)).mod(p);
    }

    for (var j=0; j<columns; j++) {
      // find the row with the maximum value of the j-th column
      var maxValue = 0;
      var maxRow = 0;
      for (var i = pivot; i < rows; i++) {
        if (mat[i][j].compare(maxValue) === 1) {
          maxRow = i;
          maxValue = mat[i][j];
        }
      }
      if (!(new BigInteger(maxValue).isZero())) {
        multiplyRow(maxRow, reciprocal(maxValue, p));
        swapRows(maxRow, pivot);

        for (i = 0; i < rows; i++) {
          if (i !== pivot) {
            // mat[i] -= mat[pivot] * mat[i][j]
            subtract_multiply(i, pivot, mat[i][j]);
          }
        }
      }
      pivot++;
    }
    return vec;
  }
  self.gauss = gauss;

  // the verification scheme
  function calcMit(coefficients, x, yi, p) {
    var d = dot(coefficients, x.slice(0, -1)).mod(p);
    var r = reciprocal(x[x.length-1], p);
    return yi.subtract(d).mod(p).multiply(r).mod(p);
  }
  self.calcMit = calcMit;

  // generate a new random portfolio
  function generateRandomPortfolio(numberOfGroups, numberOfImagesPerGroup, portfolioSize) {
    // generate a randomly shuffled list of all group id's
    var groups = randomSampleArray(Array.from(Array(numberOfGroups).keys()));

    // the portfolio consists of a subset of the groups and a randomly choosen
    // image per group
    portfolio = groups.slice(0, portfolioSize).map(
      e => [e, getRandomInt(0, numberOfImagesPerGroup - 1).toJSValue()]);
    return portfolio;
  }

  // construct the hash tuples from the portfolio
  function constructHashTuples(passwordPortfolio, salt, p) {
    return new Promise(function(resolve, reject) {
      var hashTuples = new Array(passwordPortfolio.length);
      var hashPromises = [];

      for(var i = 0; i < passwordPortfolio.length; i++) {
        var entry = passwordPortfolio[i];
        var key = new BigInteger(entry[0]).multiply(
          new BigInteger(10).pow(new BigInteger(integerLength(entry[1])))
        ).add(new BigInteger(entry[1]));
        (function(key, i) {
          var buffer = bigIntegerToUint8Array(key.add(salt).mod(p));
          var promise = crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
            hashTuples[i] = [
              passwordPortfolio[i][0],
              uint8ArrayToBigInteger(new Uint8Array(hash)).mod(p)
            ];
          });
          hashPromises.push(promise);
        })(key, i);
      }

      Promise.all(hashPromises).then(() => {
        resolve(hashTuples);
      });
    });
  }


  // =========================================================
  //                     Enrollment phase
  // =========================================================

  function New() {
    return new Promise(function(resolve, reject){
      // The parameter p is chosen according to section 5.2 in the paper

      // TODO: use parameters here
      var p = new BigInteger(nextPrime(Math.pow(16, 7) * 2));

      // let's generate a random portfolio
      var passwordPortfolio = generateRandomPortfolio(numberOfGroups, numberOfImagesPerGroup, portfolioSize);

      // a randomly choosen salt used for hashing
      var salt = getRandomInt(0, new BigInteger(2).pow(64).subtract(1));

      // a randomly choosen t-dimensional point
      var x = []; // x is of type GF[p]
      for(var i = 0; i < t; i++) {
        x.push(getRandomInt(0, p.subtract(1)));
      }

      // x[0] is our secret that can be retrieved by the blakley secret sharing
      // it is now used to build a salted hash `hashed_secret` that can be used for
      // verification of our retrieved secret is correct
      var buffer = bigIntegerToUint8Array(x[0].add(salt));
      crypto.subtle.digest("SHA-256", buffer).then(function(hash) {
        var hashed_secret = uint8ArrayToBigInteger(new Uint8Array(hash));

        // construct the hash tuples
        constructHashTuples(passwordPortfolio, salt, p).then(hashTuples => {
          var M = [];
          for(i = 0; i < n; i++) {
            // for each of the tuples, we choose t - 1 random coefficients
            var randomValues = [];
            for(var j = 0; j < t - 1; j++) {
              randomValues.push(getRandomInt(0, p.subtract(1)));
            }
            M.push(randomValues);

            // the t'th entry is calculated using the calcMit method
            M[i].push(calcMit(M[i], x, hashTuples[i][1], p).mod(p));
          }

          var groups = hashTuples.map((e) => e[0]);

          var portfolio = {M, groups, hashed_secret, salt, passwordPortfolio, p};

          resolve(portfolio);
        });
      });
    });
  }
  self.New = New;

  // =========================================================
  //               Verification of the password
  // =========================================================
  function verify(userInput, portfolio) {
    return new Promise(function(resolve, reject) {
      constructHashTuples(userInput, portfolio.salt, portfolio.p).then(verificationHashTuples => {
        var Mveri = [];
        for (var i = 0; i < userInput.length; i++) {
          var index = portfolio.groups.indexOf(userInput[i][0]);
          Mveri.push(portfolio.M[index].slice());
        }

        var xVeri = gauss(Mveri, verificationHashTuples.map((e) => e[1]), portfolio.p);

        var secretVeri = xVeri[0];
        var buffer = bigIntegerToUint8Array(xVeri[0].add(portfolio.salt));
        crypto.subtle.digest("SHA-256", buffer).then(function(hash) {
          var secretVeriHash = uint8ArrayToBigInteger(new Uint8Array(hash));
          console.log("stored hash of secret   ", portfolio.hashed_secret.toString());
          console.log("hash of retrieved secret", secretVeriHash.toString());
          if (secretVeriHash.compare(portfolio.hashed_secret) === 0) {
            resolve(secretVeri);
          } else {
            reject("Invalid login credentials.");
          }
        });
      });
    });
  }
  self.verify = verify;

  return self;
})();
