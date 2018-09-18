jQuery.noConflict();

var initializeMap = function() {
  var iterator = 74;

  for (var i = 1; i < iterator; ) {
    console.log(1);
    var $div;
    if (i == 1) {
      $div = $("<div  class='carousel-item active'>").appendTo(
        ".carousel-inner"
      );
    } else {
      $div = $("<div class='carousel-item'>").appendTo(".carousel-inner");
    }
    var $a = $(
      '<a href="data/jpg/views/Sho' +
        i +
        '.jpg" data-fancybox="images" data-caption="">'
    ).appendTo($div);
    var $img = $("<img class='d-block img-fluid'>")
      .attr("src", "data/jpg/views/Sho" + i + ".jpg")
      .attr("style", "max-height: 590px")
      .appendTo($a);
    i++;
  }
};
