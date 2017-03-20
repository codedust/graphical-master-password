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
            "data": portfolio.passwordPortfolio
          });
        });
      } else if (!PassMan.setupComplete()) {
        // portfolio has been created but images have not been shown to the user
        // yet
        console.log("setupfuckup", PassMan.getPortfolio());
        browser.tabs.sendMessage(0, {
          "action": "portfolioStatus",
          "status": "setup",
          "data": PassMan.getPortfolio().passwordPortfolio
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
        browser.tabs.sendMessage(0, { "action": "loginSuccessful" });
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
          "data": portfolio.passwordPortfolio
        });
      });
      break;
    default:
      console.log("Unknown message action:", message);
      break;
  }
});
