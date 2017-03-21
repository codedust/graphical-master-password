browser.runtime.onMessage.addListener(function(message) {
  console.log("->", message);
  switch (message.action) {
    case "requestPortfolioStatus":
      if (!PassMan.portfolioInitialized()) {
        console.log("not init");
        // portfolio has not been created yet
        PassMan.createPortfolio().then(function(portfolio){
          browser.tabs.sendMessage(0, {
            "action": "portfolioStatus",
            "status": "setup",
            "data": portfolio.plaintextPortfolio
          });
        });
      } else if (!PassMan.setupComplete()) {
        // portfolio has been created but images have not been shown to the user
        // yet
        browser.tabs.sendMessage(0, {
          "action": "portfolioStatus",
          "status": "setup",
          "data": PassMan.getPortfolio().plaintextPortfolio
        });
      } else if (!PassMan.loginSuccessful()) {
        // portfolio setup is completed. Proceed with login.
        browser.tabs.sendMessage(0, {
          "action": "portfolioStatus",
          "status": "login",
          "data": PassMan.getRandomizedCollectionIds()
        });
      } else {
        // user is logged in
        browser.tabs.sendMessage(0, {
          "action": "loginSuccessful",
          "data": PassMan.getRandomizedCollectionIds()
        });
      }
      break;
    case "validatePlaintextPortfolio":
      // let's validate the user input
      PassMan.validateUserInput(message.data).then(function(secret){
        browser.tabs.sendMessage(0, {
          "action": "loginSuccessful",
          "data": PassMan.getRandomizedCollectionIds()
        });
        PassMan.decryptPasswords();
      }, function(){
        browser.tabs.sendMessage(0, { "action": "loginFailed" });
      });
      break;
    case "logout":
      PassMan.logout();
      break;
    case "savePortfolio":
      // setup is now complete
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
        browser.tabs.sendMessage(0, {
          "action": "portfolioStatus",
          "status": "setup",
          "data": portfolio.plaintextPortfolio
        });
      });
      break;
    default:
      console.log("Unknown message action:", message);
      break;
  }
});
