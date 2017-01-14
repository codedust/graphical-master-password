(function(){
	var defaultPassword = {
		collectionIds: ['7', '4', '9', '3', '6', '1'],
		itemIds: ['6', '6', '6', '6', '6', '6']
	};
	
	function getHasSavedPassword() {
		return false;
	}

	function createPassword() {
		return defaultPassword;
	};
	
	function getRandomizedPasswordCollectionIds() {
		return defaultPassword.collectionIds;
	}
		
	function getRandomizedCollectionItemIds(collectionId) {
		return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
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
			
			var matchingIndex = $.inArray(collectionIds[i], defaultPassword.collectionIds);
			
			if (matchingIndex === -1) {
				return false
			}
			
			if (itemIds[i] != defaultPassword.itemIds[matchingIndex]) {
				return false;
			}
			
			checkedCollectionIds.push(collectionIds[i]);
		}

		return true;
	}

    PassMan = {
		createPassword: createPassword,
		getHasSavedPassword: getHasSavedPassword,
		getRandomizedPasswordCollectionIds: getRandomizedPasswordCollectionIds,
		getRandomizedCollectionItemIds: getRandomizedCollectionItemIds,
		getIsValidLoginCombination: getIsValidLoginCombination
	};
})();