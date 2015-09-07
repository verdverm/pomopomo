'use strict';

describe('logging into app', function() {

    it('should navigate to register page', function() {
        browser.get('/#/login');
        element(by.id("register-btn")).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "/#/register");
    });

    it('log a test user into the app', function() {
        browser.get('/#/login');
        element(by.id("login-username")).sendKeys("test");
        element(by.id("login-password")).sendKeys("test");

        element(by.id("login-btn")).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "/#/main");
    });

    it('should fail to log a user into the app', function() {
        browser.get('/#/login');
        element(by.id("login-username")).sendKeys("test2");
        element(by.id("login-password")).sendKeys("test2");

        element(by.id("login-btn")).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "/#/login");
    });

    it('should register a new user', function() {
        var rando = Math.random().toString(36).substring(7);

        browser.get('/#/register');
        element(by.id("register-username")).sendKeys(rando);
        element(by.id("register-email")).sendKeys(rando + "@domain.com");
        element(by.id("register-password")).sendKeys("abc123");
        element(by.id("register-confirm")).sendKeys("abc123");

        element(by.id("register-btn")).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "/#/main");
    });

});
