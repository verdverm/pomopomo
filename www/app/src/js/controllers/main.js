angular.module("pomodoroTodoApp")
    
.controller("MainViewController", 
    function($rootScope, $scope, $location, $mdDialog) {

      var self = this;
        
      self.hidden = false;
      self.showMenu = false;
      self.items = [
        {name: "Twitter", icon: "assets/svg/twitter.svg", direction: "left" },
        {name: "Phone", icon: "assets/svg/phone.svg", direction: "right" },
        {name: "Google Hangout", icon: "assets/svg/hangouts.svg", direction: "left" }
      ];

      self.toggleMenu = function($event) {
      	self.showMenu = !self.showMenu;
      	console.log("show: ", self.showMenu)
      }

      self.openDialog = function($event, item) {
        // Show the dialog
        $mdDialog.show({
          clickOutsideToClose: true,
          controller: function($mdDialog) {
            // Save the clicked item
            this.item = item;
            // Setup some handlers
            this.close = function() {
              $mdDialog.cancel();
            };
            this.submit = function() {
              $mdDialog.hide();
            };
          },
          controllerAs: 'dialog',
          templateUrl: 'dialog.html',
          targetEvent: $event
        });
      }

    }
);