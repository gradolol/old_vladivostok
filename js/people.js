$(function() {
  var people = [];
  all_buildings = [];
  var currentPerson = {
    id: 1,
    data: undefined,
    bio: "",
    address: ""
  };
  var search = "";
  var filter = 0;
  var renderedPersonId;

  var $peopleListWrap = $(".people-list-wrap");
  var $peopleList = $(".js-people-list");
  var $personDataWrap = $(".person");
  var $personData = $(".js-person-data");
  var $personSearch = $(".js-people-search");
  var $personFilter = $(".js-people-filter");
  var $mobileBackButton = $(".mobile-back-button");

  var renderList = function() {
    $peopleList.empty();
    var filteredPeople = people.filter(function(person) {
      var check = true;

      if (
        search &&
        person.name.toLowerCase().indexOf(search.toLowerCase()) !== 0
      ) {
        check = false;
      }
      if (filter && person.status !== filter) check = false;

      return check;
    });
    filteredPeople.forEach(function(person, i) {
      var $link = $("<p>");
      $link
        .html(person.name)
        .toggleClass("i-active", person.id === currentPerson.id)
        .on("click", function() {
          if (currentPerson.id === renderedPersonId) return;
          currentPerson.id = person.id;
          $personDataWrap.removeClass("i-mobile-hidden");
          $peopleListWrap.addClass("i-mobile-hidden");
          renderList();
          requestPerson();
        })
        .appendTo($peopleList);
    });
    if (
      filteredPeople.findIndex(function(person) {
        return person.id === currentPerson.id;
      }) === -1
    ) {
      currentPerson.id = filteredPeople[0].id;
      requestPerson();
    }
  };

  var renderBuild = function() {
    $(".test").html("");
    $(".carousel-inner").html("");
    all_buildings.forEach(function(building) {
      if (building.address == currentPerson.data.address) {
        $.getJSON(
          "data/json/buildings/building_" + building.id + ".json"
        ).success(function(json) {
          if (building.photo_qty > 0) {
            building.photoes.forEach(function(photo, i) {
              var $div;
              if (i == 0) {
                $div = $("<div  class='carousel-item active'>").prependTo(
                  ".carousel-inner"
                );
              } else {
                $div = $("<div class='carousel-item'>").prependTo(
                  ".carousel-inner"
                );
              }
              var $a = $(
                '<a href="data/jpg/buildings/' +
                  photo +
                  '" data-fancybox="images" data-caption="">'
              ).appendTo($div);
              var $img = $("<img class='d-block img-fluid'>")
                .attr("src", "data/jpg/buildings/" + photo)
                .attr("style", "max-height: 300px;")
                .on("load", function() {
                  $img.prependTo($a);
                });
            });
          }

          $("<h4>")
            .text("Адрес нахождения: " + building.address)
            .appendTo(".test");

          $.get(
            "data/txt/path/" + building.descript,
            function(text) {
              $("<p>")
                .text(text)
                .appendTo(".test");
            },
            "text"
          );
          $("#myModal").modal("show");
        });
      }
    });
  };

  var renderPerson = function() {
    if (currentPerson.id === renderedPersonId) return;
    var p = people.find(function(person) {
      return person.id === currentPerson.id;
    });
    $personData.empty();
    var $img = $("<img class='person__photo'>")
      .attr("src", "data/jpg/people/" + currentPerson.data.photo)
      .on("load", function() {
        $img.prependTo($personData);
      });
    $("<h1 class='person__title'>")
      .text(currentPerson.data.name)
      .appendTo($personData);
    if (currentPerson.data.address) {
      var $h6 = $("<h6>")
        .text("Проживал(а) по адресу: " + currentPerson.data.address)
        .appendTo($personData);
    }
    $($h6).on("click", function() {
      renderBuild();
    });
    currentPerson.bio.split("\n").forEach(function(p) {
      $("<p>")
        .html(p)
        .appendTo($personData);
      renderedPersonId = p.id;
    });
    $;
  };

  var requestList = function(cb) {
    $.getJSON("data/json/people/people.json").success(function(json) {
      people = json.people;
      renderList();
      requestBuildings();
      if (typeof cb === "function") cb();
    });
  };

  var requestBuildings = function() {
    $.getJSON("data/json/buildings/buildings.json").success(function(json) {
      all_buildings = json.buildings;
    });
  };

  var requestPerson = function() {
    if (currentPerson.id === renderedPersonId) return;
    var p = people.find(function(person) {
      return person.id === currentPerson.id;
    });
    $.getJSON("data/json/people/people_" + p.id + ".json").success(function(
      data
    ) {
      currentPerson.data = data;
      $.get(
        "data/txt/people/" + data.bio,
        function(text) {
          currentPerson.bio = text;
          renderPerson();
        },
        "text"
      );
    });
  };

  $personSearch.on("keyup", function(e) {
    search = e.currentTarget.value;
    renderList();
  });

  $personFilter.on("change", function(e) {
    filter = Number(e.currentTarget.value);
    renderList();
  });

  $mobileBackButton.on("click", function() {
    $personDataWrap.addClass("i-mobile-hidden");
    $peopleListWrap.removeClass("i-mobile-hidden");
  });

  requestList(function() {
    requestPerson();
  });
});
