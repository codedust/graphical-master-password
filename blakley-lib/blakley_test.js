/* jshint esversion: 6 */
var $ = function(q) {
  return document.querySelector(q);
};

function test(name, expression, expect) {
  if (expression === expect) {
    $("#log").innerHTML += "<p class=\"passed\">["+((new Date()).toLocaleTimeString())+"] "+
      "Test <i>"+name+"</i> passed.</p>";
  } else {
    $("#log").innerHTML += "<p class=\"failed\">["+((new Date()).toLocaleTimeString())+"] "+
      "Test <i>"+name+"</i> failed. "+
      "Expected: <span class=\"value\">"+expect+"</span>, "+
      "but got <span class=\"value\">"+expression+"</span></p>";
  }
}

test("isPrime(0)", blakley.math.isPrime(0), false);
test("isPrime(1)", blakley.math.isPrime(1), false);
test("isPrime(2)", blakley.math.isPrime(2), true);
test("isPrime(3)", blakley.math.isPrime(3), true);
test("isPrime(4)", blakley.math.isPrime(4), false);
test("isPrime(5)", blakley.math.isPrime(5), true);
test("isPrime(536870923)", blakley.math.isPrime(536870923), true);
test("isPrime(536870924)", blakley.math.isPrime(536870924), false);
test("nextPrime(Math.pow(16, 7) * 2)", blakley.math.nextPrime(Math.pow(16, 7) * 2), 536870923);
test("getRandomInt", blakley.math.getRandomInt(0, 0).toString(), '0');
test("getRandomInt", blakley.math.getRandomInt(234, 234).toString(), '234');
test("getRandomInt", ['10', '11'].indexOf(blakley.math.getRandomInt(10, 11).toString()) != -1, true);

arr = blakley.randomSampleArray([1,2,3]);
test("randomSampleArray1", arr.length, 3);
test("randomSampleArray2", arr.indexOf(1) != -1, true);
test("randomSampleArray3", arr.indexOf(2) != -1, true);
test("randomSampleArray4", arr.indexOf(3) != -1, true);

test('BigInteger', new BigInteger("0b"+(3363047741).toString(2)+
  blakley.leftpad((4126339018).toString(2), 32, "0")).toString(),
  '14444180066608017354');

test('BigInteger<->Uint8Array 1',
     blakley.uint8ArrayToBigInteger(blakley.bigIntegerToUint8Array(
       new BigInteger(123456))).toString(),
     '123456');

test('BigInteger<->Uint8Array 2',
     blakley.uint8ArrayToBigInteger(blakley.bigIntegerToUint8Array(
       new BigInteger('2575939070979920166'))).toString(),
     '2575939070979920166');



// === calcMit test ===
var p = new BigInteger(blakley.math.nextPrime(Math.pow(16, 7) * 2));

var Mtest = [
 [235902437, 478737980, 469505273, 402623524, 6156863, 211899227, 307548322],
 [359449637, 272168359, 20041489, 409624198, 292626134, 249166255, 367154708],
 [224433777, 285888633, 58746851, 296078442, 527112097, 46331759, 137760878],
 [284247779, 197391493, 328260854, 502880355, 194793934, 249118388, 436323011],
 [214372240, 83238576, 379895130, 417820081, 419842396, 243825034, 189343286],
 [195312484, 112854730, 424420207, 19839969, 420504933, 463959257, 302346417],
 [433649697, 83438841, 378033566, 337750540, 383013040, 9222235, 213076504]];

// convert `Mtest` to BigInteger
for(i = 0; i < Mtest.length; i++) {
 for (j = 0; j < Mtest[0].length; j++) {
   Mtest[i][j] = new BigInteger(Mtest[i][j]);
 }
}

xTest = [
  new BigInteger(178000214), new BigInteger(409168349),
  new BigInteger(501937999), new BigInteger(395375707),
  new BigInteger(245454470), new BigInteger(443488947),
  new BigInteger(387922063)];



  var buffer = blakley.bigIntegerToUint8Array(new BigInteger("178000214").add(new BigInteger('2575939070979920166')));
  var promise = crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
    console.log(blakley.uint8ArrayToBigInteger(new Uint8Array(hash)).toString());
    console.log(p.toString());
  });



hashTuplesTest = [[ 1, new BigInteger('7616919222356268285226494388013067381826080614484526657789935791734028352602')],
                  [ 3, new BigInteger('33103877873694120367817780695228349719574260677948984461690793432147688971365')],
                  [ 5, new BigInteger('90656303662353035367995057797833935758783020210502605198248493414057069850769')],
                  [ 8, new BigInteger('7996190747862678192494640249422758211498319494741142044130412493721861112947')],
                  [16, new BigInteger('93080373900740345170186499004260010550038249661732398017682314623507572826533')],
                  [19, new BigInteger('58096244620714767882079317372179508504348036322373943408637855742450701382014')],
                  [20, new BigInteger('16543633987400437488985127707496544361562099537157721836784124025082366733371')]];
hashTuplesTest.map((e) => e[1] = e[1].mod(p));

Mit = blakley.calcMit(Mtest[0].slice(0, 6), xTest, hashTuplesTest[0][1], p).mod(p);
test("calcMit", Mit.toString(), '307548322');

// === simple gauss-jordan test ===
var result = blakley.gauss([[new BigInteger(1), new BigInteger(2)],
                            [new BigInteger(3), new BigInteger(4)]],
                            [new BigInteger(5), new BigInteger(6)],
                            new BigInteger(7));
test("gauss[0]", result[0].toString(), '3');
test("gauss[1]", result[1].toString(), '1');


// === extensive gauss-jordan test ===
xExpect = [178000214, 409168349, 501937999, 395375707, 245454470, 443488947, 387922063];
xExpect.map((e) => e = new BigInteger(e));

xTest = blakley.gauss(Mtest, hashTuplesTest.map((e) => e[1]), new BigInteger(p));
test("xTest.length == 7", xTest.length, 7);
for(var i = 0; i < xTest.length; i++) {
  test("xtest["+i+"]", xTest[i].compare(xExpect[i]), 0);
}


blakley.New().then(function(portfolio) {
  // generating correct user input ;)
  var userInput = blakley.randomSampleArray(portfolio.passwordPortfolio).slice(0, t);
  portfolio.passwordPortfolio = null; // we must not store this
  blakley.verify(userInput, portfolio).then(function(secret) {
    test("verifyCorrectly", true, true);
    console.log("secretVeri", secret.toString());
  }, function(error) {
    test("verifyCorrectly", false, true);
  });
});

blakley.New().then(function(portfolio) {
  // generating correct user input ;)
  var userInput = blakley.randomSampleArray(portfolio.passwordPortfolio).slice(0, t);
  portfolio.passwordPortfolio = null; // we must not store this
  userInput[1][1]++;
  blakley.verify(userInput, portfolio).then(function(secret) {
    test("verifyInvalid", true, false);
  }, function(error) {
    test("verifyInvalid", false, false);
  });
});
