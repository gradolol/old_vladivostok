$(function() {
  var hist_first = [];
  var hist_second = [];
  var hist = [];
  var currentHist = {
    id: undefined,
    src: undefined,
    photo: undefined,
    data: undefined,
    photodata: undefined
  };

  var filter = 0;
  var renderedHistId;

  var $peopleListWrap = $(".people-list-wrap");
  var $peopleList = $(".js-people-list");
  var $personDataWrap = $(".person");
  var $personData = $(".js-person-data");
  var $personFilter = $(".js-people-filter");
  var $mobileBackButton = $(".mobile-back-button");
  var $photoFav = $(".carousel-inner");

  var renderInfo = function() {
    if (currentHist.id === renderedHistId) return;
    var p = hist.find(function(info) {
      return info.id === currentHist.id;
    });
    $personData.empty();
    $("<h1 class='person_title'>")
      .text(p.name)
      .appendTo($personData);
    renderHist();
  };

  var renderHist = function() {
    if (filter === 0) {
      currentHist.photo.forEach(function(photoes, i) {
        var $div;
        if (i == 0) {
          $($photoFav).html("");
          $div = $("<div  class='carousel-item active'>").appendTo($photoFav);
        } else {
          $div = $("<div class='carousel-item'>").appendTo($photoFav);
        }
        var $a = $(
          '<a href="data/jpg/hist/' +
            photoes +
            '" data-fancybox="images" data-caption="">'
        ).appendTo($div);

        var $img = $("<img class='d-block img-fluid'>")
          .attr("src", "data/jpg/hist/" + photoes)
          .attr("style", "max-height: 300px;")
          .on("load", function() {
            $img.prependTo($a);
          });
      });
    }
    $.get("data/txt/hist/" + currentHist.src, function(text) {
      currentHist.data = text;
      currentHist.data.split("\n").forEach(function(p) {
        $("<p>")
          .text(p)
          .appendTo($personData);
      }, "text");
    });
  };

  var requestHist = function() {
    var count = 0;
    $.getJSON("data/json/history/history-second.json").success(function(json) {
      hist_first = json.history;
      if (++count === 2) renderList();
    });
    $.getJSON("data/json/history/history-first.json").success(function(json) {
      hist_second = json.history;
      if (++count === 2) renderList();
    });
  };

  var renderList = function() {
    $peopleList.empty();
    hist = filter === 0 ? hist_first : hist_second;
    if (
      hist.findIndex(function(hist) {
        return hist.id === currentHist.id;
      }) === -1
    ) {
      currentHist.id = hist[0].id;
      currentHist.src = hist[0].src;
      currentHist.photo = hist[0].photo;
      renderInfo();
    }
    hist.forEach(function(hist, id) {
      var $link = $("<p>");
      $link
        .html(hist.name)
        .toggleClass("i-active", hist.id === currentHist.id)
        .on("click", function() {
          currentHist.id = hist.id;
          currentHist.src = hist.src;
          currentHist.photo = hist.photo;
          $personDataWrap.removeClass("i-mobile-hidden");
          $peopleListWrap.addClass("i-mobile-hidden");
          renderList();
          renderInfo();
        })
        .appendTo($peopleList);
    });
  };

  requestHist();

  $personFilter.on("change", function(e) {
    filter = Number(e.currentTarget.value);
    currentHist.id = 0;
    renderList();
    renderInfo();
  });

  $mobileBackButton.on("click", function() {
    $personDataWrap.addClass("i-mobile-hidden");
    $peopleListWrap.removeClass("i-mobile-hidden");
  });
});
