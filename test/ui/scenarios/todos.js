'use strict';

describe('todo manipulations: ', function() {

    var todos = element.all(by.repeater('item in listCtrl.todos'));

    var newTodoBtn = element(by.id("new-todo-btn"));
    var createBtn =  element(by.id("create-btn"));
    var newTodoName = element(by.id("new-todo-name-input"));
    var newTodoDescription = element(by.id("new-todo-description-input"))

    beforeEach(function() {
        browser.get('/#/login');
        element(by.id("login-username")).sendKeys("test");
        element(by.id("login-password")).sendKeys("test");

        element(by.id("login-btn")).click();
    })

    it('clear all of the current todos', function() {
        // remove any current todos for the test user
        // remove any current todos for the test user
        var deleteTodos = function() {
            todos.count().then(function(cnt){
                // console.log("TODOS COUNT: ", cnt);

                if ( cnt > 0 ) {
                    // browser.driver.wait(function() {
                        var elem = todos.first();
                        elem.element(by.className("todo-delete-btn")).click();
                        element(by.xpath('//button[contains(., "Please do it!")]')).click().click();
                    //     return true;
                    // }, 5000);
                    deleteTodos();
                }
            });
        }

        deleteTodos();

        expect(todos.count()).toEqual(0);
    })
 

    it('create a new todo', function() {
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "/#/main");

        newTodoBtn.click();
        newTodoName.sendKeys("protractor todo");
        newTodoDescription.sendKeys("my first protractor created todo");
        createBtn.click();

        expect(todos.count()).toEqual(1);

    });

    it('fail to create a new todo', function() {

        newTodoBtn.click();
        newTodoName.sendKeys("protractor todo");
        newTodoDescription.sendKeys("this one should fail");
        createBtn.click();

        expect(todos.count()).toEqual(1);

    });

    it('create a second todo', function() {

        newTodoBtn.click();
        newTodoName.sendKeys("protractor todo 2");
        newTodoDescription.sendKeys("this is the second todo");
        createBtn.click();

        expect(todos.count()).toEqual(2);

    });

    it('update the first todo in the list', function() {

        todos.first().element(by.className("todo-edit-btn")).click();
        todos.first().element(by.className("todo-update-description-input")).sendKeys("\n!!!altered!!!")
        todos.first().element(by.className("update-btn")).click();
        expect(todos.count()).toEqual(2);

    });

});
