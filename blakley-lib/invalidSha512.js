(function() {
  // TODO remove this
  salt = new BigInteger('2575939070979920166');
  b = (new BigInteger('178000214')).add(salt).mod(p);
  var buffer = bigIntegerToUint8Array(b);

  crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
    // TODO: somehow javascripts sha256 seems to differ from the mathematica implementation (?)
    console.log(new Uint8Array(hash));
    console.log(uint8ArrayToBigInteger(new Uint8Array(hash)).toString());
  });
})();
