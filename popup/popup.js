$(function() {
  /* Misc Variables */

  var clickCount;
  var plaintextPortfolio;
  var portfolioGroups;
  var userInput;

  /* Helper Functions */
  function prepareLogin() {
    clickCount = 0;
    userInput = [];
    showLoginGallery(portfolioGroups[0]);
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
    var collectionId = plaintextPortfolio[clickCount][0];
    var itemId = plaintextPortfolio[clickCount][1];
    $('#container .view#setupSteps .passwordDisplay img').attr('src', Config.IMG_BASE_DIR + (collectionId + 1).toString() + '/' + (itemId + 1).toString() + Config.IMG_FULLSIZE_FILENAME_SUFFIX + Config.IMG_FILE_EXTENSION);
  }

  function showLoginGallery(collectionId) {
    var itemIds = Array.apply(null, {length: Config.NUM_ITEMS_PER_COLLECTION}).map(Number.call, Number);

    $('#container .view#login div.passwordGallery > div > img').each(function(index) {
      if (index >= itemIds.length) {
        return;
      }

      $(this).attr('src', Config.IMG_BASE_DIR + (collectionId + 1).toString() + '/' + (itemIds[index] + 1).toString() + Config.IMG_FILE_EXTENSION);
      $(this).attr('data-collection', collectionId);
      $(this).attr('data-item', itemIds[index]);
    });
  }

  function setActiveView(viewId) {
    $('.view').removeClass('active');
    $('.view#' + viewId).addClass('active');
  }

  /* Initialization */

  $('#container span.numStepsPerLogin').text(Config.NUM_STEPS_PER_LOGIN);
  $('#container span.numPasswordParts').text(Config.NUM_PASSWORD_PARTS);

  browser.runtime.sendMessage({"action": "requestPortfolioStatus"});

  browser.runtime.onMessage.addListener(function(message) {
    console.log("<-", message);
    switch (message.action) {
      case "portfolioStatus":
        switch (message.status) {
          case "setup":
            plaintextPortfolio = message.data;
            portfolioGroups = null;
            setActiveView('setup');
            break;
          case "login":
            plaintextPortfolio = null;
            portfolioGroups = message.data;
            prepareLogin();
            setActiveView('login');
            break;
          default:
            console.log("Unknown portfolio state:", message);
        }
        break;
      case "setupSuccessful":
        setActiveView('setupComplete');
        plaintextPortfolio = null;
        portfolioGroups = message.data;
        break;
      case "loginSuccessful":
        setActiveView('loggedIn');
        break;
      case "loginFailed":
        setActiveView('loginFailed');
        break;
      default:
        console.log("Unknown message action:", message);
    }
  });


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
    browser.runtime.sendMessage({"action": "savePortfolio"});
  });

  $('#container .view#login > div.passwordGallery > div > img').click(function() {
    userInput.push([
      parseInt($(this).attr('data-collection')),
      parseInt($(this).attr('data-item'))
    ]);
    clickCount++;

    if (clickCount === Config.NUM_STEPS_PER_LOGIN) {
      browser.runtime.sendMessage({
        "action": "validatePlaintextPortfolio",
        "data": userInput
      });
    } else {
      showLoginGallery(portfolioGroups[clickCount]);
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
    browser.runtime.sendMessage({"action": "resetPortfolio"});
  });
});
