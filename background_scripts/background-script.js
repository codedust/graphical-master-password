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

/*jshint esversion: 6 */
browser.runtime.openOptionsPage();

browser.runtime.onMessage.addListener(function(message) {
  console.log("->", message);
  switch (message.action) {
    case "requestPortfolioStatus":
      if (!PassMan.portfolioInitialized() || !PassMan.setupComplete()) {
        // portfolio has not been created yet
        PassMan.createPortfolio(null).then(function(){
          PassMan.getPlaintextPortfolio().then(function(plaintextPortfolio){
            browser.tabs.sendMessage(0, {
              "action": "portfolioStatus",
              "status": "setup",
              "data": plaintextPortfolio
            });
          });
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
        PassMan.getPlaintextPortfolio().then(function(plaintextPortfolio){
          browser.tabs.sendMessage(0, {
            "action": "portfolioStatus",
            "status": "loginSuccessful",
            "data": plaintextPortfolio
          });
        });
      }
      break;
    case "validatePlaintextPortfolio":
      // let's validate the user input
      PassMan.validateUserInput(message.data).then(function(secret){
        PassMan.getPlaintextPortfolio().then(function(plaintextPortfolio){
          browser.tabs.sendMessage(0, {
            "action": "portfolioStatus",
            "status": "loginSuccessful",
            "data": plaintextPortfolio
          });
          PassMan.decryptPasswords();
        });
      }, function(){
        browser.tabs.sendMessage(0, { "action": "loginFailed" });
      });
      break;
    case "logout":
      PassMan.logout().then(() => {
        browser.tabs.sendMessage(0, {
          "action": "portfolioStatus",
          "status": "login",
          "data": PassMan.getRandomizedCollectionIds()
        });
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
      PassMan.resetPortfolio().then(function() {
        PassMan.getPlaintextPortfolio().then(function(plaintextPortfolio){
          browser.tabs.sendMessage(0, {
            "action": "portfolioStatus",
            "status": "setup",
            "data": plaintextPortfolio
          });
        });
      });
      break;
    case "changePortfolio":
      PassMan.changePortfolioGroup(message.data).then(plaintextPortfolio => {
        console.log("Successfully changed portfolio group!");
        browser.tabs.sendMessage(0, {
          "action": "portfolioStatus",
          "status": "change",
          "data": plaintextPortfolio
        });
      }, function(reason) {
        console.log("Error while changing portfolio group!", reason);
      });
      break;
    default:
      console.log("Unknown message action:", message);
      break;
  }
});
