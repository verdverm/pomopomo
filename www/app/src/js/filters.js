angular.module("pomodoroTodoApp")

.filter('clocktime', function() {
  return function(input) {
    if(input < 0) {
        return '';
    }
    
    var len = parseInt( Math.ceil(input) );
    var hours = parseInt( Math.floor(len / 3600) );

    len = len - (hours * 3600)
    var min = parseInt( Math.floor(len / 60) );
    var sec = len % 60;

    var out = "";
    if (hours > 0) {
        out = hours + ":";
    }
    if (min < 10) {
        out = out + "0" + min + ":";
    } else {
        out = out + min + ":";
    }
    if (sec < 10) {
        out = out + "0" + sec;
    } else {
        out = out + sec;
    }

    return out;
  };
})
