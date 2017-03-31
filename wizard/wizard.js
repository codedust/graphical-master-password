/*
Graphical Master Password

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var clickCount = 0;
var clickCountMax = 0;
var plaintextPortfolio = null;

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
          setActiveView('help');
          break;
        case "login":
          setActiveView('setupComplete');
          break;
        case "loginSuccessful":
          setActiveView('setupComplete');
          break;
        case "change":
          setActiveView('setupComplete');
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
      setActiveView('setupComplete');
      break;
    case "requestPortfolioStatus": // ignore
      break;
    default:
      console.log("Unknown message action:", message);
  }
});

// ===== Event handlers =====

// === help ===
$('#container .view#help .setupButton').click(function() {
  console.log(plaintextPortfolio);
  if (plaintextPortfolio !== null) {
    setActiveView('setup');
  } else {
    setActiveView('setupComplete');
  }
});

$('#container .view#setup .startButton').click(function() {
  clickCount = 0;
  clickCountMax = 0;
  showSetupImage(clickCount);
  setActiveView('setupSteps');
});

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

$('#container .view#setupComplete .helpButton').click(function() {
  setActiveView('help');
});


// ===== ===== ===== ===== =====
// ===== ===== ===== ===== =====
// ===== ===== ===== ===== =====

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

function setActiveView(viewId) {
  $('.view').removeClass('active');
  $('.view#' + viewId).addClass('active');
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
      }, 100);
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
