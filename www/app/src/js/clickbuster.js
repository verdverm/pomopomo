
var clickbuster = clickbuster || {};


clickbuster.preventGhostClick = function(x, y) {
  clickbuster.coordinates.push(x, y);
  window.setTimeout(clickbuster.pop, 500);
};

clickbuster.pop = function() {
  clickbuster.coordinates.splice(0, 2);
};

clickbuster.onClick = function(event) {
  if(event == undefined || event == null || event == false) {
    return true;
  }
  // console.log("clickbuster - ENTER ", clickbuster.coordinates, event);

  if (event.type === "tap") {
      event.clientX = event.center.x
      event.clientY = event.center.y
  } 

  if (event.clientX === 0 && event.clientY === 0) {
    // console.log("clickbuster - ZERO");
    return false;
  }
  for (var i = 0; i < clickbuster.coordinates.length; i += 2) {
    var x = clickbuster.coordinates[i];
    var y = clickbuster.coordinates[i + 1];
    if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
      if (event.stopPropagation) {
        event.stopPropagation();
      }      
      if (event.preventDefault) {
        event.preventDefault();
      }
      return false;
    }
  }
  clickbuster.preventGhostClick(event.clientX, event.clientY);
  // console.log("clickbuster - PASS ");
  return true;
};

document.addEventListener('click', clickbuster.onClick, true);
clickbuster.coordinates = [];
