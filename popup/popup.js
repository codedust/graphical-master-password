$(function() {
	var clickCount;
	var newPassword;
	var passwordCollectionIds;
	var selectedCollectionIds;
	var selectedItemIds;
	
	function prepareSetup() {
		clickCount = 0;
		newPassword = PassMan.createPassword();
		propagateSetupClickCount();
	}
	
	function prepareLogin() {
		clickCount = 0;
		passwordCollectionIds = PassMan.getRandomizedPasswordCollectionIds();
		selectedCollectionIds = [];
		selectedItemIds = [];
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
		$('#setupSteps span.currentStep').text(clickCount + 1);
	}
	
	function setActiveView(viewId) {
		$('.view').removeClass('active');
		$('.view#' + viewId).addClass('active');
	}

	$('#container span.numStepsPerLogin').text(Config.NUM_STEPS_PER_LOGIN);
	$('#container span.numPasswordParts').text(Config.NUM_PASSWORD_PARTS);
	
	if (!PassMan.getHasSavedPassword()) {
		setActiveView('setup');
	} else {
		setActiveView('enterPassword');
	}
		
	$('#container .view#setup .startButton').click(function() {
		prepareSetup();
		showNextSetupImage();
		setActiveView('setupSteps');
	});
	
	$('#container .view#setupSteps .cancelButton').click(function() {
		setActiveView('setup');
	});
	
	$('#container .view#setupSteps .nextButton').click(function() {
		clickCount++;
				
		if (clickCount < Config.NUM_PASSWORD_PARTS) {
			propagateSetupClickCount();
			showNextSetupImage();
			return;
		}
		
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
		showLoginGallery(passwordCollectionIds[clickCount]);
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
});