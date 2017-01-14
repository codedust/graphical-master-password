(function(){
	var availableCollectionIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
	var availableItemIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];

	var savedPassword = JSON.parse(localStorage.getItem('savedPassword')) || {
		collectionIds: [],
		itemIds: []
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
		return (savedPassword && savedPassword.collectionIds && savedPassword.collectionIds.length > 0 && savedPassword.itemIds.length > 0);
	}

	function createPassword() {
		savedPassword.collectionIds = []
		
		// Password are generated using cryptographic password functions.
		do {
			var randArr = new Uint32Array(1);
			window.crypto.getRandomValues(randArr);
			var rand = randArr[0] % availableCollectionIds.length;

			if ($.inArray(availableCollectionIds[rand], savedPassword.collectionIds) != -1) {
				continue;
			}
			
			savedPassword.collectionIds.push(availableCollectionIds[rand]);
		} while (savedPassword.collectionIds.length < Config.NUM_PASSWORD_PARTS);
		
		var randArr = new Uint32Array(Config.NUM_PASSWORD_PARTS);
		window.crypto.getRandomValues(randArr);

		savedPassword.itemIds = [];
		for (var i = 0; i < randArr.length; i++) {
			savedPassword.itemIds.push(availableItemIds[randArr[i] % availableItemIds.length]);
		}
		
		localStorage.setItem('savedPassword', JSON.stringify(savedPassword));
		return savedPassword;
	};
	
	function removePassword() {
		localStorage.removeItem('savedPassword');

		savedPassword = {
			collectionIds: [],
			itemIds: []
		}	
	}	
	
	function getRandomizedPasswordCollectionIds() {
		var collectionIds = savedPassword.collectionIds.slice();
		shuffleArray(collectionIds);
		return collectionIds;
	}
		
	function getRandomizedCollectionItemIds(collectionId) {
		// Right now all collections use the same item IDs. Thus, collectionId is ignored.
		var itemIds = availableItemIds.slice();
		shuffleArray(itemIds);
		return itemIds;
	}

	function getIsValidLoginCombination(collectionIds, itemIds) {
		if (!collectionIds || !itemIds || collectionIds.length != Config.NUM_STEPS_PER_LOGIN || itemIds.length != Config.NUM_STEPS_PER_LOGIN) {
			return false;
		}
		
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

    PassMan = {
		createPassword: createPassword,
		getHasSavedPassword: getHasSavedPassword,
		removePassword: removePassword,
		getRandomizedPasswordCollectionIds: getRandomizedPasswordCollectionIds,
		getRandomizedCollectionItemIds: getRandomizedCollectionItemIds,
		getIsValidLoginCombination: getIsValidLoginCombination
	};
})();