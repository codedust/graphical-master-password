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

    if (clickCount >= Config.NUM_IMAGE_GROUPS_PER_PORTFOLIO - 1) {
      finishButton.removeClass('hidden');
    }

    // update the image
    var groupId = plaintextPortfolio[clickCount][0];
    var itemId = plaintextPortfolio[clickCount][1];
    $('#container .view#setupSteps .passwordDisplay img').attr('src', Config.IMG_BASE_DIR + (groupId + 1).toString() + '/' + (itemId + 1).toString() + Config.IMG_FULLSIZE_FILENAME_SUFFIX + Config.IMG_FILE_EXTENSION);
  }

  function showLoginGallery(groupId) {
    $('#container .view#login div.passwordGallery > div > img').each(function(index) {
      if (index >= Config.NUM_IMAGES_PER_GROUP) {
        return;
      }

      $(this).attr('src', Config.IMG_BASE_DIR + (groupId + 1).toString() + '/' + (index + 1).toString() + Config.IMG_FILE_EXTENSION);
      $(this).attr('data-collection', groupId);
      $(this).attr('data-item', index);
    });
  }

  function showChangePasswordGallery(groupIndex) {
    // update the click count
    if (groupIndex >= 0) {
      clickCount = groupIndex;
    }

    // update the text
    $('#container .view#changePassword span.currentStep').text(clickCount + 1);

    // update the buttons
    var nextButton = $('#container .view#changePassword > div > button.nextButton');
    var previousButton = $('#container .view#changePassword > div > button.previousButton');
    //var resetButton = $('#container .view#changePassword > div > button.resetImageGroupButton');
    var finishButton = $('#container .view#changePassword > div > button.finishButton');

    if (clickCount === 0) {
      previousButton.addClass('hidden');
    } else {
      previousButton.removeClass('hidden');
    }

    if (clickCount + 1 < Config.NUM_IMAGE_GROUPS_PER_PORTFOLIO) {
      nextButton.removeClass('hidden');
      finishButton.addClass('hidden');
    } else {
      nextButton.addClass('hidden');
      finishButton.removeClass('hidden');
    }

    // update the image
    groupId = plaintextPortfolio[clickCount][0];
    var itemId = plaintextPortfolio[clickCount][1];
    $('#container .view#changePassword .passwordDisplay img').attr('src', Config.IMG_BASE_DIR + (groupId + 1).toString() + '/' + (itemId + 1).toString() + Config.IMG_FULLSIZE_FILENAME_SUFFIX + Config.IMG_FILE_EXTENSION);

  }

  function setActiveView(viewId) {
    $('.view').removeClass('active');
    $('.view#' + viewId).addClass('active');
  }

  /* Initialization */

  $('#container span.numStepsPerLogin').text(Config.NUM_IMAGE_GROUPS_PER_LOGIN);
  $('#container span.numImageGroups').text(Config.NUM_IMAGE_GROUPS_PER_PORTFOLIO);

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
            portfolioGroups = message.data;
            prepareLogin();
            setActiveView('login');
            break;
          case "loginSuccessful":
            plaintextPortfolio = message.data;
            setActiveView('loggedIn');
            break;
          case "change":
            plaintextPortfolio = message.data;
            showChangePasswordGallery(-1);
            break;
          default:
            console.log("Unknown portfolio state:", message);
            break;
        }
        break;
      case "setupSuccessful":
        portfolioGroups = message.data;
        setActiveView('setupComplete');
        break;
      case "loginFailed":
        setActiveView('loginFailed');
        break;
      default:
        console.log("Unknown message action:", message);
    }
  });


  /* Event Handling */

  // === setup ===

  $('#container .view#setup .startButton').click(function() {
    showSetupImage(0);
    setActiveView('setupSteps');
  });

  // === setupSteps ===

  $('#container .view#setupSteps .cancelButton').click(function() {
    setActiveView('setup');
  });

  $('#container .view#setupSteps .nextButton').click(function() {
    if (clickCount >= Config.NUM_IMAGE_GROUPS_PER_PORTFOLIO - 1) {
      return;
    }
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

  // === login ===

  $('#container .view#login > div.passwordGallery > div > img').click(function() {
    userInput.push([
      parseInt($(this).attr('data-collection')),
      parseInt($(this).attr('data-item'))
    ]);
    clickCount++;

    if (clickCount === Config.NUM_IMAGE_GROUPS_PER_LOGIN) {
      browser.runtime.sendMessage({
        "action": "validatePlaintextPortfolio",
        "data": userInput
      });
    } else {
      showLoginGallery(portfolioGroups[clickCount]);
    }
  });

  $('#container .view#login .forgotPasswordButton').click(function() {
    setActiveView('forgotPassword');
  });

  // === loggedIn ===

  $('#container .view#loggedIn .logoutButton').click(function() {
    browser.runtime.sendMessage({"action": "logout"});
    portfolioGroups = plaintextPortfolio.map(e => e[0]);
    plaintextPortfolio = null;
    prepareLogin();
    setActiveView('login');
  });

  // === setupComplete ===

  $('#container .view#setupComplete .loginButton').click(function() {
    portfolioGroups = plaintextPortfolio.map(e => e[0]);
    plaintextPortfolio = null;
    prepareLogin();
    setActiveView('login');
  });

  // === loginFailed / forgotPassword ===

  $('#container .view#loginFailed .loginButton, #container .view#forgotPassword .okButton').click(function() {
    prepareLogin();
    setActiveView('login');
  });

  // === changePassword ===

  $('#container .view#loggedIn .changePasswordButton').click(function() {
    setActiveView('changePassword');
    showChangePasswordGallery(0);
  });

  $('#container .view#changePassword .resetImageGroupButton').click(function() {
    browser.runtime.sendMessage({"action": "changePortfolio", "data": plaintextPortfolio[clickCount][0]});
  });

  $('#container .view#changePassword .cancelButton').click(function() {
    setActiveView('loggedIn');
  });

  $('#container .view#changePassword .nextButton').click(function() {
    if (clickCount >= Config.NUM_IMAGE_GROUPS_PER_PORTFOLIO - 1) {
      return;
    }
    showChangePasswordGallery(clickCount + 1);
  });

  $('#container .view#changePassword .previousButton').click(function() {
    if (clickCount <= 0) {
      return;
    }
    showChangePasswordGallery(clickCount - 1);
  });

  // === forgotPassword ===

  $('#container .view#forgotPassword .resetPasswordButton, #container .view#changePassword .resetPasswordButton').click(function() {
    browser.runtime.sendMessage({"action": "resetPortfolio"});
  });

});
