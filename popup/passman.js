(function(){
  var availableCollectionIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
  var availableItemIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];

  var savedPassword = getSavedPassword();

  function makeHash(arr, salt, rounds) {
    var input = arr.toString() + salt;
    var count = 0;

    var shaObj = new jsSHA('SHA-256', 'TEXT');

    do {
      shaObj.update(input);
      count++;
    } while (count < rounds);

    return hash = shaObj.getHash('HEX');
  }

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

  function getHasSavedPassword() {
    return (savedPassword && savedPassword.collectionIds && savedPassword.collectionIds.length > 0);
  }

  function createPassword() {
    savedPassword.collectionIds = []

    // The password is generated using cryptographic password functions.
    do {
      var randArr = new Uint32Array(1);
      window.crypto.getRandomValues(randArr);
      var rand = randArr[0] % availableCollectionIds.length;

      if ($.inArray(availableCollectionIds[rand], savedPassword.collectionIds) != -1) {
        continue;
      }

      savedPassword.collectionIds.push(availableCollectionIds[rand]);
    } while (savedPassword.collectionIds.length < Config.NUM_PASSWORD_PARTS);

    savedPassword.collectionIds.sort();

    var randArr = new Uint32Array(Config.NUM_PASSWORD_PARTS);
    window.crypto.getRandomValues(randArr);

    savedPassword.itemIds = [];
    for (var i = 0; i < randArr.length; i++) {
      savedPassword.itemIds.push(availableItemIds[randArr[i] % availableItemIds.length]);
    }

    // DEBUG/TEMPORARY
    savedPassword.itemIds = ['6', '6', '6', '6', '6', '6', '6', '6', '6', '6'];

    return savedPassword;
  };

  function savePassword() {
    if (Config.NUM_STEPS_PER_LOGIN === 4 && Config.NUM_PASSWORD_PARTS === 10) {
      savePassword1004(savedPassword.collectionIds, savedPassword.itemIds);
      return;
    }

    // TODO BLAKLEY: Save the password data (see below) and protect it with Blakley secret sharing.
    //
    // At this point, you have two arrays with password data:
    //
    // - savedPassword.collectionIds: This array contains the IDs of the galleries (ID = relative path name).
    // - savedPassword.itemIds: This array contains CORRESPONDING IDs that make up the password (ID = filename without extension)
    //
    // "Corresponding" means that the index of the gallery and the index of the item match. E.g., if image "5" from gallery "7"
    // and image "6" of gallery "9" were assigned to the user as a password, these arrays would like this:
    //
    // - savedPassword.collectionIds = ["7", "9"] (actual length == Config.NUM_STEPS_PER_LOGIN)
    // - savedPassword.itemIds = ["5", "6"] (actual length == Config.NUM_PASSWORD_PARTS)
    //
    // Please note that while currently all IDs are numbers, these might as well be strings. Adjust the following so that it saves
    // the encrypted password information according to your needs. Currently, the password is saved in clear text.
    localStorage.setItem('savedPassword', JSON.stringify(savedPassword));
  }

  function removePassword() {
    savedPassword = {
      collectionIds: [],
      itemIds: []
    }

    if (Config.NUM_STEPS_PER_LOGIN === 4 && Config.NUM_PASSWORD_PARTS === 10) {
      removePassword1004();
      return;
    }

    // TODO BLAKLEY: You can change the following line to point to whatever storage location you store your password data at.
    // If you do, make sure that you also changed the location where the password is stored and retrieved from.
    localStorage.removeItem('savedPassword');
  }

  function getRandomizedPasswordCollectionIds() {
    var collectionIds = savedPassword.collectionIds.slice();
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

  function getIsValidLoginCombination(collectionIds, itemIds) {
    if (!collectionIds || !itemIds || collectionIds.length != Config.NUM_STEPS_PER_LOGIN || itemIds.length != Config.NUM_STEPS_PER_LOGIN) {
      return false;
    }

    if (Config.NUM_STEPS_PER_LOGIN === 4 && Config.NUM_PASSWORD_PARTS === 10) {
      return getIsValidLoginCombination1004(collectionIds, itemIds);
    }

    // TODO BLAKLEY: Check whether the input supplied by the user matches a valid password variation.
    //
    // The user has supplied the following data:
    //
    // - collectionIds: This array contains the IDs of the galleries (ID = relative path name).
    // - itemIds: This array contains CORRESPONDING IDs that make up the password (ID = filename without extension).
    //
    // The collections are linked, e.g. itemIds[3] corresponds to collectionIds[3]. See comments in savePassword() for more details for the
    // data stored inside the arrays.
    //
    // Return "true" if the user entered a valid password. Your code should replace the following lines completely.
    var checkedCollectionIds = [];

    for (var i = 0; i < Config.NUM_STEPS_PER_LOGIN; i++) {
      if ($.inArray(collectionIds[i], checkedCollectionIds) != -1) {
        return false;
      }

      var matchingIndex = $.inArray(collectionIds[i], savedPassword.collectionIds);

      if (matchingIndex === -1) {
        return false
      }

      if (itemIds[i] != savedPassword.itemIds[matchingIndex]) {
        return false;
      }

      checkedCollectionIds.push(collectionIds[i]);
    }

    return true;
  }

  function getSavedPassword() {
    if (Config.NUM_STEPS_PER_LOGIN === 4 && Config.NUM_PASSWORD_PARTS === 10) {
      return getSavedPassword1004();
    }

    // TODO BLAKLEY: You can replace the following code to point to a different location or structure.
    //
    // BUT: Currently other parts of this library operate on the savedPassword object and expect it to
    // have the properties "collectionIds" and "itemIds". Thus, if you change this structure, you will
    // have to make changes in other places as well. Please try not to break the functionality of the
    // methods with the "1004" suffix when doing this.
    //
    // Info on what the arrays that the properties point to contain can be found in the comments for
    // the savePassword() method.
    var pass = JSON.parse(localStorage.getItem('savedPassword')) || { collectionIds: [], itemIds: [] };
    return pass;
  }

  function getSavedPassword1004() {
    var pass = JSON.parse(localStorage.getItem('savedPassword')) || { collectionIds: [], itemIds: [] };
    return pass;
  }

  function getIsValidLoginCombination1004(collectionIds, itemIds) {
    var pairs = [];

    for (var i = 0; i < collectionIds.length; i++) {
      pairs.push({ collectionId: + collectionIds[i] + '', itemId: itemIds[i] + ''});
    }

    pairs.sort(function(a, b){
      if(a.collectionId < b.collectionId) return -1;
      if(a.collectionId > b.collectionId) return 1;
      return 0;
    });

    var combinedInput = [];
    for (var i = 0; i < pairs.length; i++) {
      combinedInput.push(pairs[i].collectionId);
      combinedInput.push(pairs[i].itemId);
    }

    var hash = makeHash(combinedInput, savedPassword.salt, savedPassword.rounds);
    return ($.inArray(hash, savedPassword.passwordHashes) > -1);
  }


  function removePassword1004() {
    localStorage.removeItem('savedPassword');
  }

  function savePassword1004(col, val) {
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
    localStorage.setItem('savedPassword', JSON.stringify(output));
  }

    PassMan = {
    createPassword: createPassword,
    getHasSavedPassword: getHasSavedPassword,
    savePassword: savePassword,
    removePassword: removePassword,
    getRandomizedPasswordCollectionIds: getRandomizedPasswordCollectionIds,
    getRandomizedCollectionItemIds: getRandomizedCollectionItemIds,
    getIsValidLoginCombination: getIsValidLoginCombination
  };
})();
