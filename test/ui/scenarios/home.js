// this file tests the home page buttons navigate to the correct pages
'use strict';

describe('pomodoros', function() {
  var loginBtn = element(by.id("login-btn"));
  var registerBtn = element(by.id("register-btn"));

  beforeEach(function(){
      browser.get("#/");
  })

  it('should nav to login page', function() {
      loginBtn.click()
      expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "/#/login")
  });

  it('should nav to register page', function() {
      registerBtn.click()
      expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "/#/register")
  });

  
});
