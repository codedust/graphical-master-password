var setupComplete = false;
var passwordPortfolio;

browser.runtime.onMessage.addListener(function(message) {
  console.log("->", message);
  switch (message.action) {
    case "requestPortfolioStatus":
      if (!PassMan.portfolioInitialized()) {
        console.log("not init");
        // portfolio has not been created yet
        PassMan.createPortfolio().then(function(portfolio){
          passwordPortfolio = portfolio.passwordPortfolio;
          browser.tabs.sendMessage(0, {
            "action": "portfolioStatus",
            "status": "setup",
            "data": passwordPortfolio
          });
        });
      } else if (!setupComplete) {
        // portfolio has been created but images have not been shown to the user
        // yet
        if (!passwordPortfolio) {
          // the passwordPortfolio may not be present if the browser creshed
          // during setup
          PassMan.createPortfolio().then(function(portfolio){
            passwordPortfolio = portfolio.passwordPortfolio;
            browser.tabs.sendMessage(0, {
              "action": "portfolioStatus",
              "status": "setup",
              "data": passwordPortfolio
            });
          });
        } else {
          browser.tabs.sendMessage(0, {
            "action": "portfolioStatus",
            "status": "setup",
            "data": passwordPortfolio
          });
        }
      } else {
        // portfolio setup is completed. Proceed with login.
        browser.tabs.sendMessage(0, {
          "action": "portfolioStatus",
          "status": "login",
          "data": PassMan.getRandomizedCollectionIds()
        });
      }
      break;
    case "validatePlaintextPortfolio":
      // let's validate the user input
      PassMan.validateUserInput(message.data).then(function(secret){
        browser.tabs.sendMessage(0, { "action": "loginSuccessful" });
      }, function(){
        browser.tabs.sendMessage(0, { "action": "loginFailed" });
      });
      break;
    case "savePortfolio":
      // setup is now complete
      setupComplete = true;
      passwordPortfolio = null;

      PassMan.savePortfolio();
      browser.tabs.sendMessage(0, {
        "action": "setupSuccessful",
        "data": PassMan.getRandomizedCollectionIds()
      });
      break;
    case "resetPortfolio":
      // let's reset the portfolio
      PassMan.removePortfolio();
      PassMan.createPortfolio().then(function(portfolio){
        setupComplete = false;
        passwordPortfolio = portfolio.passwordPortfolio;
        browser.tabs.sendMessage(0, {
          "action": "portfolioStatus",
          "status": "setup",
          "data": portfolio.passwordPortfolio
        });
      });
      break;
    default:
      console.log("Unknown message action:", message);
      break;
  }
});
