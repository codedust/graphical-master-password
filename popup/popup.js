$(function() {
	/* Misc Variables */
	
	var clickCount;
	var newPassword;
	var passwordCollectionIds;
	var selectedCollectionIds;
	var selectedItemIds;

	/* Helper Functions */
	
	function prepareSetupSteps() {
		clickCount = 0;
		newPassword = PassMan.createPassword();
		propagateSetupClickCount();
		showNextSetupImage();
	}
	
	function prepareLogin() {
		clickCount = 0;
		passwordCollectionIds = PassMan.getRandomizedPasswordCollectionIds();
		selectedCollectionIds = [];
		selectedItemIds = [];
		showLoginGallery(passwordCollectionIds[0]);
	}
	
	function showNextSetupImage() {
		var collectionId = newPassword.collectionIds[clickCount];
		var itemId = newPassword.itemIds[clickCount];

		$('#container .view#setupSteps .passwordDisplay img').attr('src', Config.IMG_BASE_DIR + collectionId + '/' + itemId + Config.IMG_FULLSIZE_FILENAME_SUFFIX + Config.IMG_FILE_EXTENSION);
	}
	
	function showLoginGallery(collectionId) {
		var itemIds = PassMan.getRandomizedCollectionItemIds(collectionId);
		
		$('#container .view#login div.passwordGallery > div > img').each(function(index) {
			if (index >= itemIds.length) {
				return;
			}
			
			$(this).attr('src', Config.IMG_BASE_DIR + collectionId + '/' + itemIds[index] + Config.IMG_FILE_EXTENSION);
			$(this).attr('data-collection', collectionId);
			$(this).attr('data-item', itemIds[index]);
		});	
	}

	function propagateSetupClickCount() {
		$('#container .view#setupSteps span.currentStep').text(clickCount + 1);
		
		var nextButton = previousButton = $('#container .view#setupSteps > div > button.nextButton');
		var previousButton = $('#container .view#setupSteps > div > button.previousButton');
		var finishButton = $('#container .view#setupSteps > div > button.finishButton');
		
		if (clickCount === 0) {
			previousButton.addClass('hidden');
		} else {
			previousButton.removeClass('hidden');
		}
		
		if (clickCount + 1 < Config.NUM_PASSWORD_PARTS) {
			nextButton.removeClass('hidden');
			finishButton.addClass('hidden');
		} else {
			nextButton.addClass('hidden');
			finishButton.removeClass('hidden');
		}		
	}
	
	function setActiveView(viewId) {
		$('.view').removeClass('active');
		$('.view#' + viewId).addClass('active');
	}

	/* Initialization */
	
	$('#container span.numStepsPerLogin').text(Config.NUM_STEPS_PER_LOGIN);
	$('#container span.numPasswordParts').text(Config.NUM_PASSWORD_PARTS);
	
	if (!PassMan.getHasSavedPassword()) {
		setActiveView('setup');
	} else {
		prepareLogin();
		setActiveView('login');
	}

	/* Event Handling */
	
	$('#container .view#setup .startButton').click(function() {
		prepareSetupSteps();		
		setActiveView('setupSteps');
	});
	
	$('#container .view#setupSteps .cancelButton').click(function() {
		setActiveView('setup');
	});
	
	$('#container .view#setupSteps .nextButton').click(function() {
		clickCount++;
		propagateSetupClickCount();
		showNextSetupImage();		
	});
	
	$('#container .view#setupSteps .previousButton').click(function() {
		if (clickCount <= 0) {
			return;
		}

		clickCount--;
		propagateSetupClickCount();
		showNextSetupImage();
	});
	
	$('#container .view#setupSteps .finishButton').click(function() {
		PassMan.savePassword();
		setActiveView('setupComplete');
	});
	
	$('#container .view#login > div.passwordGallery > div > img').click(function() {
		selectedCollectionIds.push($(this).attr('data-collection'));
		selectedItemIds.push($(this).attr('data-item'));
		clickCount++;
		
		if (clickCount === Config.NUM_STEPS_PER_LOGIN) {
			if (PassMan.getIsValidLoginCombination(selectedCollectionIds, selectedItemIds)) {				
				setActiveView('loggedIn');
			}
			else {
				setActiveView('loginFailed');
			}
		} else {
			showLoginGallery(passwordCollectionIds[clickCount]);
		}
	});

	$('#container .view#setupComplete .loginButton, #container .view#loginFailed .loginButton, #container .view#forgotPassword .okButton, #container .view#loggedIn .logoutButton').click(function() {
		prepareLogin();
		setActiveView('login');
	});

	$('#container .view#login .forgotPasswordButton').click(function() {
		setActiveView('forgotPassword');
	});
	
	$('#container .view#loggedIn .changePasswordButton').click(function() {
		setActiveView('changePassword');
	});
	
	$('#container .view#changePassword .cancelButton').click(function() {
		setActiveView('loggedIn');
	});
	
	$('#container .view#forgotPassword .resetPasswordButton').click(function() {
		PassMan.removePassword();
		prepareSetupSteps();
		setActiveView('setup');
	});
});