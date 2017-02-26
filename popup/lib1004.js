var availableCollectionIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
var availableItemIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];

function makeHash(arr, salt, rounds) {
  var input = arr.toString() + salt;
  var count = 0;

  var shaObj = new jsSHA('SHA-256', 'TEXT');

  do {
    shaObj.update(input);
    count++;
  } while (count < rounds);

  return shaObj.getHash('HEX');
}

function createPortfolio1004() {
  savedPassword = { collectionIds: [], itemIds: [] };

  var randArr;
  // The password is generated using cryptographic password functions.
  do {
    randArr = new Uint32Array(1);
    window.crypto.getRandomValues(randArr);
    var rand = randArr[0] % availableCollectionIds.length;

    if ($.inArray(availableCollectionIds[rand], savedPassword.collectionIds) != -1) {
      continue;
    }

    savedPassword.collectionIds.push(availableCollectionIds[rand]);
  } while (savedPassword.collectionIds.length < Config.NUM_PASSWORD_PARTS);

  savedPassword.collectionIds.sort();

  randArr = new Uint32Array(Config.NUM_PASSWORD_PARTS);
  window.crypto.getRandomValues(randArr);

  savedPassword.itemIds = [];
  for (var i = 0; i < randArr.length; i++) {
    savedPassword.itemIds.push(availableItemIds[randArr[i] % availableItemIds.length]);
  }

  // DEBUG/TEMPORARY
  savedPassword.itemIds = ['6', '6', '6', '6', '6', '6', '6', '6', '6', '6'];

  return savedPassword;
}


function savePortfolio1004(col, val) {
  console.log(JSON.stringify(col));
  var salt = window.crypto.getRandomValues(new Uint32Array(1)).toString();
  var rounds = Config.NUM_HASH_ROUNDS;
  var hashes = [];
  console.log(JSON.stringify(val));

  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[2], val[2], col[3], val[3]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[2], val[2], col[4], val[4]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[2], val[2], col[5], val[5]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[2], val[2], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[2], val[2], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[2], val[2], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[2], val[2], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[3], val[3], col[4], val[4]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[3], val[3], col[5], val[5]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[3], val[3], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[3], val[3], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[3], val[3], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[3], val[3], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[4], val[4], col[5], val[5]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[4], val[4], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[4], val[4], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[4], val[4], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[4], val[4], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[5], val[5], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[5], val[5], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[5], val[5], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[5], val[5], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[1], val[1], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[3], val[3], col[4], val[4]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[3], val[3], col[5], val[5]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[3], val[3], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[3], val[3], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[3], val[3], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[3], val[3], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[4], val[4], col[5], val[5]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[4], val[4], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[4], val[4], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[4], val[4], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[4], val[4], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[5], val[5], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[5], val[5], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[5], val[5], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[5], val[5], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[2], val[2], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[4], val[4], col[5], val[5]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[4], val[4], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[4], val[4], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[4], val[4], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[4], val[4], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[5], val[5], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[5], val[5], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[5], val[5], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[5], val[5], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[3], val[3], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[4], val[4], col[5], val[5], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[4], val[4], col[5], val[5], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[4], val[4], col[5], val[5], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[4], val[4], col[5], val[5], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[4], val[4], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[4], val[4], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[4], val[4], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[4], val[4], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[4], val[4], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[4], val[4], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[5], val[5], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[5], val[5], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[5], val[5], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[5], val[5], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[5], val[5], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[5], val[5], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[6], val[6], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[6], val[6], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[6], val[6], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[0], val[0], col[7], val[7], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[3], val[3], col[4], val[4]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[3], val[3], col[5], val[5]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[3], val[3], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[3], val[3], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[3], val[3], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[3], val[3], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[4], val[4], col[5], val[5]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[4], val[4], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[4], val[4], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[4], val[4], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[4], val[4], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[5], val[5], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[5], val[5], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[5], val[5], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[5], val[5], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[2], val[2], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[4], val[4], col[5], val[5]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[4], val[4], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[4], val[4], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[4], val[4], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[4], val[4], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[5], val[5], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[5], val[5], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[5], val[5], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[5], val[5], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[3], val[3], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[4], val[4], col[5], val[5], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[4], val[4], col[5], val[5], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[4], val[4], col[5], val[5], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[4], val[4], col[5], val[5], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[4], val[4], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[4], val[4], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[4], val[4], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[4], val[4], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[4], val[4], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[4], val[4], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[5], val[5], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[5], val[5], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[5], val[5], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[5], val[5], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[5], val[5], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[5], val[5], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[6], val[6], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[6], val[6], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[6], val[6], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[1], val[1], col[7], val[7], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[4], val[4], col[5], val[5]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[4], val[4], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[4], val[4], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[4], val[4], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[4], val[4], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[5], val[5], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[5], val[5], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[5], val[5], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[5], val[5], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[3], val[3], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[4], val[4], col[5], val[5], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[4], val[4], col[5], val[5], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[4], val[4], col[5], val[5], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[4], val[4], col[5], val[5], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[4], val[4], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[4], val[4], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[4], val[4], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[4], val[4], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[4], val[4], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[4], val[4], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[5], val[5], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[5], val[5], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[5], val[5], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[5], val[5], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[5], val[5], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[5], val[5], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[6], val[6], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[6], val[6], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[6], val[6], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[2], val[2], col[7], val[7], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[4], val[4], col[5], val[5], col[6], val[6]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[4], val[4], col[5], val[5], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[4], val[4], col[5], val[5], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[4], val[4], col[5], val[5], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[4], val[4], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[4], val[4], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[4], val[4], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[4], val[4], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[4], val[4], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[4], val[4], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[5], val[5], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[5], val[5], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[5], val[5], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[5], val[5], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[5], val[5], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[5], val[5], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[6], val[6], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[6], val[6], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[6], val[6], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[3], val[3], col[7], val[7], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[4], val[4], col[5], val[5], col[6], val[6], col[7], val[7]], salt, rounds));
  hashes.push(makeHash([col[4], val[4], col[5], val[5], col[6], val[6], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[4], val[4], col[5], val[5], col[6], val[6], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[4], val[4], col[5], val[5], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[4], val[4], col[5], val[5], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[4], val[4], col[5], val[5], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[4], val[4], col[6], val[6], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[4], val[4], col[6], val[6], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[4], val[4], col[6], val[6], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[4], val[4], col[7], val[7], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[5], val[5], col[6], val[6], col[7], val[7], col[8], val[8]], salt, rounds));
  hashes.push(makeHash([col[5], val[5], col[6], val[6], col[7], val[7], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[5], val[5], col[6], val[6], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[5], val[5], col[7], val[7], col[8], val[8], col[9], val[9]], salt, rounds));
  hashes.push(makeHash([col[6], val[6], col[7], val[7], col[8], val[8], col[9], val[9]], salt, rounds));

  var output = {
    collectionIds: col,
    salt: salt,
    rounds: rounds,
    masterHash: makeHash(col, salt, rounds),
    passwordHashes: hashes
  };

  console.log(output);
  savedPassword = output;
  localStorage.setItem('portfolio', JSON.stringify(output));
}

function getIsValidLoginCombination1004(collectionIds, itemIds) {
  var pairs = [];

  var i;
  for (i = 0; i < collectionIds.length; i++) {
    pairs.push({ collectionId: + collectionIds[i] + '', itemId: itemIds[i] + ''});
  }

  pairs.sort(function(a, b){
    if(a.collectionId < b.collectionId) return -1;
    if(a.collectionId > b.collectionId) return 1;
    return 0;
  });

  var combinedInput = [];
  for (i = 0; i < pairs.length; i++) {
    combinedInput.push(pairs[i].collectionId);
    combinedInput.push(pairs[i].itemId);
  }

  var hash = makeHash(combinedInput, savedPassword.salt, savedPassword.rounds);
  return ($.inArray(hash, savedPassword.passwordHashes) > -1);
}
