$(function() {
  /* Misc Variables */

  var clickCount;
  var portfolio;
  var passwordCollectionIds;
  var selectedCollectionIds;
  var selectedItemIds;

  /* Helper Functions */
  function prepareLogin() {
    clickCount = 0;
    passwordCollectionIds = PassMan.getRandomizedCollectionIds();
    selectedCollectionIds = [];
    selectedItemIds = [];
    showLoginGallery(passwordCollectionIds[0]);
  }

  function showSetupImage(image) {
    // update the click count
    clickCount = image;

    // update the text
    $('#container .view#setupSteps span.currentStep').text(clickCount + 1);

    // update the buttons
    var nextButton = $('#container .view#setupSteps > div > button.nextButton');
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

    // update the image
    var collectionId = portfolio.passwordPortfolio[clickCount][0];
    var itemId = portfolio.passwordPortfolio[clickCount][1];
    $('#container .view#setupSteps .passwordDisplay img').attr('src', Config.IMG_BASE_DIR + (collectionId + 1).toString() + '/' + (itemId + 1).toString() + Config.IMG_FULLSIZE_FILENAME_SUFFIX + Config.IMG_FILE_EXTENSION);
  }

  function showLoginGallery(collectionId) {
    var itemIds = PassMan.getRandomizedCollectionItemIds(collectionId);

    $('#container .view#login div.passwordGallery > div > img').each(function(index) {
      if (index >= itemIds.length) {
        return;
      }

      $(this).attr('src', Config.IMG_BASE_DIR + (collectionId + 1).toString() + '/' + (itemIds[index] + 1).toString() + Config.IMG_FILE_EXTENSION);
      $(this).attr('data-collection', collectionId);
      $(this).attr('data-item', itemIds[index]);
    });
  }

  function propagateSetupClickCount() {

  }

  function setActiveView(viewId) {
    $('.view').removeClass('active');
    $('.view#' + viewId).addClass('active');
  }

  /* Initialization */

  $('#container span.numStepsPerLogin').text(Config.NUM_STEPS_PER_LOGIN);
  $('#container span.numPasswordParts').text(Config.NUM_PASSWORD_PARTS);

  if (!PassMan.portfolioInitialized()) {
    PassMan.createPortfolio().then(function(newPortfolio){
      portfolio = newPortfolio;
      setActiveView('setup');
    });
  } else {
    prepareLogin();
    setActiveView('login');
  }

  /* Event Handling */

  $('#container .view#setup .startButton').click(function() {
    showSetupImage(0);
    setActiveView('setupSteps');
  });

  $('#container .view#setupSteps .cancelButton').click(function() {
    setActiveView('setup');
  });

  $('#container .view#setupSteps .nextButton').click(function() {
    showSetupImage(clickCount + 1);
  });

  $('#container .view#setupSteps .previousButton').click(function() {
    if (clickCount <= 0) {
      return;
    }

    showSetupImage(clickCount - 1);
  });

  $('#container .view#setupSteps .finishButton').click(function() {
    PassMan.savePortfolio();
    setActiveView('setupComplete');
  });

  $('#container .view#login > div.passwordGallery > div > img').click(function() {
    selectedCollectionIds.push($(this).attr('data-collection'));
    selectedItemIds.push($(this).attr('data-item'));
    clickCount++;

    if (clickCount === Config.NUM_STEPS_PER_LOGIN) {
      PassMan.getIsValidLoginCombination(selectedCollectionIds, selectedItemIds).then(function(secret){
        setActiveView('loggedIn');
      }, function(){
        setActiveView('loginFailed');
      });
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

  $('#container .view#forgotPassword .resetPasswordButton, #container .view#changePassword .resetPasswordButton').click(function() {
    PassMan.removePortfolio();
    PassMan.createPortfolio().then(function(newPortfolio){
      portfolio = newPortfolio;
      setActiveView('setup');
    });
  });
});
