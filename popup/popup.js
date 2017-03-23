$(function() {
  /* Misc Variables */
  var clickCount;
  var clickCountMax;
  var plaintextPortfolio;
  var portfolioGroups;
  var userInput;

  /* Helper Functions */
  function applyInternationalization() {
    var containerHTML = document.getElementById('container').innerHTML;

	// find templates wrapped in {{..}}
    var translationTemplates = containerHTML
  	.match(/{{\s*[\w\.]+\s*}}/g)
  	.map(function(x) {
  		return x.match(/[\w\.]+/)[0];
  	});

    var translationReplacements = {};
    var translationRegex = '';

	// build replacement map
	for (var i = 0; i < translationTemplates.length; i++) {
  	var templateId = '{{' + translationTemplates[i] + '}}';
  	  translationReplacements[templateId] = browser.i18n.getMessage(translationTemplates[i]);
  	  translationRegex += (translationRegex.length > 0 ? '|' : '') + templateId;
    }

	// replace in one go
    document.getElementById('container').innerHTML = containerHTML.replace(new RegExp(translationRegex, 'g'), function(matched){
      return translationReplacements[matched];
    });
  }

  function prepareLogin() {
    clickCount = 0;
    clickCountMax = 0;
    userInput = [];
    showLoginGallery(portfolioGroups[0]);
  }

  function showSetupImage(image) {
    // update the click count
    clickCount = image;
    clickCountMax = Math.max(clickCount, clickCountMax);

    // update the text
    $('#container .view#setupSteps span.currentStep').text(clickCount + 1);

    // update the buttons
    var nextButton = $('#container .view#setupSteps > div > button.nextButton');
    var previousButton = $('#container .view#setupSteps > div > button.previousButton');
    var finishButton = $('#container .view#setupSteps > div > button.finishButton');

    if (clickCount >= Config.NUM_IMAGE_GROUPS_PER_PORTFOLIO - 1) {
      finishButton.removeClass('hidden');
    }

    if (clickCount == Config.NUM_IMAGE_GROUPS_PER_PORTFOLIO - 1) {
      nextButton.prop('disabled', true);
      nextButton.addClass('gray');
    } else if (clickCount < clickCountMax) {
      nextButton.prop('disabled', false);
      nextButton.removeClass('gray');
      nextButton.removeClass('animateToActive');
    } else if (clickCount == clickCountMax) {
      nextButton.prop('disabled', true);

      if (clickCount < Config.NUM_IMAGE_GROUPS_PER_PORTFOLIO - 1) {
        nextButton.removeClass('animateToActive');
        window.setTimeout(function(){
          nextButton.addClass('animateToActive');
        }, 1);
        window.setTimeout(function(){
          nextButton.prop('disabled', false);
        }, 3000);
      }
    } else {
      nextButton.prop('disabled', false);
      nextButton.removeClass('animateToActive');
    }

    if (clickCount <= 0) {
      previousButton.prop('disabled', true);
      previousButton.addClass('gray');
    } else {
      previousButton.prop('disabled', false);
      previousButton.removeClass('gray');
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

  applyInternationalization();

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
            plaintextPortfolio = null;
            console.log("login", message.data);
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
        plaintextPortfolio = null;
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
    clickCount = 0;
    clickCountMax = 0;
    showSetupImage(clickCount);
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
  });

  // === setupComplete ===

  $('#container .view#setupComplete .loginButton').click(function() {
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

    $(this).prop('disabled', true);
    window.setTimeout(function(){
      $('#container .view#changePassword .resetImageGroupButton').prop('disabled', false);
    }, 1000);
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
