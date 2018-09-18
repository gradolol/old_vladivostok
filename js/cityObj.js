jQuery.noConflict();
var all_buildings = [];
var all_markers = [];
var all_peoples = [];
var all_streets = [];
var streets = [];
var selected_marker;
var active_street = null;
var active_home = null;
var visible = true;

var initializeMap = function() {
  document.getElementById("map_canvas").style.height =
    window.innerHeight - 108 + "px";
  document.getElementById("parent").style.height =
    window.innerHeight - 120 + "px";
  document.getElementById("tab-content").style.height =
    window.innerHeight - 120 - 83 + "px";
  // window.onresize = function() {
  //   document.getElementById("parent").style.height =
  //     window.innerHeight - 120 + "px";
  //   document.getElementById("tab-content").style.height =
  //     window.innerHeight - 120 - 83 + "px";
  // };
  var myLatlng = new google.maps.LatLng(43.1120123, 131.88055280000003);
  var myOptions = {
    zoom: 14,
    center: myLatlng
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  var geo = new google.maps.Geocoder();
  $(".button-hide").on("click", function() {
    if (visible) {
      $("#parent").hide("slow");
      $(".button-hide").removeClass("button-visible");
      $(".button-hide").addClass("block-invized");
      $(".button-hide").addClass("block-invized-ever");
      $("#map_canvas").removeClass("col-lg-10");
      $("#map_canvas").addClass("col-lg-12");
      $("#map_canvas").removeClass("col-md-9");
      $("#map_canvas").addClass("col-md-12");
      $("#map_canvas").addClass("col-xs-12");
      $("#map_canvas").removeClass("map_telephone_invisible");
      $("#map_canvas").addClass("map_telephone_visible");
      $(".button-span-text").html("Раскрыть");
      visible = false;
    } else {
      $(".button-hide").removeClass("block-invized");
      $(".button-hide").removeClass("block-invized-ever");
      $(".button-hide").addClass("button-visible");
      $("#map_canvas").removeClass("col-xs-12");
      $("#map_canvas").addClass("map_telephone_invisible");
      $("#map_canvas").removeClass("map_telephone_visible");
      $("#parent").show("slow");
      $("#map_canvas").removeClass("col-lg-12");
      $("#map_canvas").addClass("col-lg-10");
      $("#map_canvas").removeClass("col-md-12");
      $("#map_canvas").addClass("col-md-9");
      $(".button-span-text").html("Скрыть");
      visible = true;
    }
  });
  setAllStreets();
	};

var setAllStreets = function() {
  $.getJSON("data/json/buildings/streets.json").success(function(json) {
    all_streets = json.streets;
    all_streets.forEach(function(street) {
      $.getJSON(
        "data/json/buildings/street_" + street.street_id + ".json"
      ).success(function(data) {
        data.buildings.forEach(function(building) {
          var $str = String(String(building.address).match(/.*?, (\d+)/g));
          var $preg = $str.match(/,{1}\s([0-9]{1,3})\s?/g);
					if ($preg != null) {
            var $first = $preg[0].slice(1);
										//if(street.street_id==20) {building.str = $str.substring(0, $str.indexOf(','));
										building.str = $str.substring(0, $str.indexOf(','));										
										//console.log(building.str);
										
										} else {
            var $first = " 0";
          }
          $final = $first.slice(1);
          building.number = Number($final);
					
        });
       // data.buildings = data.buildings.sort((a, b) => a.number - b.number);
			  data.buildings = data.buildings.sort(function(a, b){if(a.str==b.str) return a.number - b.number;});
        data.street_id = street.street_id;
        street = data.street.sort;
				//console.log(data.street);
        streets.push(data);
      });
    });
		setAllBuildings();
  });
};

var setAllBuildings = function() {
  $.getJSON("data/json/buildings/buildings.json").success(function(json) {
    all_buildings = json.buildings;
		//console.log(all_buildings);
    setAllPeoples();
		
  });
};

var setAllPeoples = function() {
  $.getJSON("data/json/people/people.json").success(function(json) {
    all_peoples = json.people;
    renderMarkers();
    //renderBuildings();
		renderStreets();
		chooseStreets();
  });
};

var renderMarkers = function() {
  all_markers = [];
  all_buildings.forEach(function(building, i) {
    all_markers.push(
      new google.maps.Marker({
        id: building.id,
        title: building.address,
        map: map,
        descript: building.descript,
        photo_qty: building.photo_qty,
        images: building.photoes,
        owner: building.owner,
        year: building.year,
        original_purpose: building.original_purpose,
        address: building.address,
        position: { lat: building.lat, lng: building.lng },
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        building: building
      })
    );
		//if(building.id==3) alert (building.owner);
    building.marker = all_markers[i];
    all_markers[i].setMap(map);
    addEventToMarker(all_markers[i]);
    streets.forEach(function(street) {
      street.buildings.forEach(function(home) {
        if (home.address == building.address) {
          home.title = building.address;
          home.map = map;
          home.descript = building.descript;
          home.photo_qty = building.photo_qty;
          home.photoes = building.photoes;
          home.owner = building.owner;
          home.year = building.year;
          home.original_purpose = building.original_purpose;
          home.position = { lat: building.lat, lng: building.lng };
          home.icon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
          home.building = building;
          home.marker = all_markers[i];
        }
      });
    });
  });
};

var addEventToMarker = function(marker) {
  google.maps.event.addListener(marker, "click", function(evt) {
    renderInfo(marker.building);
    displayMarker(marker);
    if (active_home) {
      active_home.removeClass("active-home");
    }
    $("#" + marker.id)
      .get(0)
      .scrollIntoView();
    $("#" + marker.id).addClass("active-home");
    active_home = $("#" + marker.id);
  });
};

var renderStreets = function() {
  $(".streets").html("");
  streets.forEach(function(street) {
    renderStreet(street, street.street_id);
  });
};

var renderStreet = function(street, i) {
  console.log(street);
  $('<div  class="street_' + i + '">').appendTo(".streets");
  var $street = $('<a class="street_' + i + 'a">')
    .html(street.street)
    .attr("idr", i)
    .appendTo(".street_" + i);
  street.buildings.forEach(function(building) {
    $("<a>")
      .html(building.address)
      .attr("id", building.id)
      .attr("style", "display: flex; padding-left: 20px;")
      .on("click", function() {
        all_buildings.forEach(function(home) {
          if (home.address == building.address) {
            if (active_home) {
              active_home.removeClass("active-home");
            }
            $("#" + home.id).addClass("active-home");
            renderInfo(home);
            displayMarker(home.marker);
            active_home = $("#" + home.id);
          }
        });
      })
      .hide()
      .appendTo(".street_" + i);
  });
  $($street).on("click", function() {
    var $id = $(this).attr("idr");
    all_streets.forEach(function(data) {
      if (data.street_id == $id) {
        streets.forEach(function(result) {
          if (result.street == data.name) {
            result.buildings.forEach(function(home) {
              if (active_street != $id) {
                $(".street_" + $id).addClass("active-street");
                $("#" + home.id).removeClass("active-home");
                active_home = null;
                $("#" + home.id).toggle("slow");
                all_markers.forEach(function(marker) {
                  if (marker.id == home.id) {
                    if (marker.map == null) {
                      renderStreetMarker(marker);
                    } else {
                      marker.setMap(null);
                    }
                  }
                });
              } else {
                $(".street_" + $id).removeClass("active-street");
                $("#" + home.id).removeClass("active-home");
                active_home = null;
                $("#" + home.id).hide("slow");
                all_markers.forEach(function(marker) {
                  marker.setMap(null);
                });
              }
            });
          }
        });
      }
    });
    if (active_street == $id) {
      active_street = null;
    } else {
      all_streets.forEach(function(data) {
        if (data.street_id == active_street) {
          streets.forEach(function(result) {
            if (result.street == data.name) {
              result.buildings.forEach(function(home) {
                $("#" + home.id).hide("slow");
                all_markers.forEach(function(marker) {
                  if (marker.id == home.id) {
                    marker.setMap(null);
                    $(".street_" + active_street).removeClass("active-street");
                    $("#" + home.id).removeClass("active-home");
                    active_home = null;
                  }
                });
              });
            }
          });
        }
      });
      active_street = $id;
    }
  });
};

var renderStreetMarker = function(streetMarker) {
  streetMarker.setMap(map);
};

var renderBuildings = function() {
  $(".buildings").html("");
//	streets.sort(function(a,b){if(a.buildings.str==b.buildings.str) return a.buildings.number-b.buildings.number});
    streets.forEach(function(street) {
    street.buildings.forEach(function(home) {
      var $a = $("<a id=" + home.id + ">")
        .html(home.address)
        .on("click", function() {
          if (active_home) {
            active_home.removeClass("active-home");
          }
          $($a).addClass("active-home");
          renderInfo(home);
          displayMarker(home.marker);
          active_home = $a;
        })
        .appendTo(".buildings");
				
    });
  });
};

var renderInfo = function(building) {
  console.log(building);
  $(".test").html("");
  $(".carousel-inner").html("");
  if (building.photo_qty > 0) {
    building.photoes.forEach(function(photo, i) {
      var $div;
      if (i == 0) {
        $div = $("<div  class='carousel-item active'>").appendTo(
          ".carousel-inner"
        );
      } else {
        $div = $("<div class='carousel-item'>").appendTo(".carousel-inner");
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

  if (building.owner) {
    var $h6 = $("<h6>")
      .text("Жилец или хозяин здания: " + building.owner)
      .addClass("owner")
      .appendTo(".test");
    all_peoples.forEach(function(man) {
      if (man.name == building.owner) {
        $.getJSON("data/json/people/people_" + man.id + ".json").success(
          function(json) {
            console.log(json);
            $.get(
              "data/txt/people/" + json.bio,
              function(text) {
                $h6second = $("<h6>").insertAfter($h6);
                $p = $("<p>")
                  .addClass("people-text")
                  .hide()
                  .text(text)
                  .appendTo($h6second);
                var $a = $(
                  '<a href="data/jpg/people/' +
                    json.photo +
                    '" data-fancybox="images-people" data-caption="">'
                ).prependTo($p);
                var $img = $("<img>")
                  .attr("src", "data/jpg/people/" + json.photo)
                  .attr("style", "max-width: 150px;")
                  .attr("float", "left")
                  .on("load", function() {
                    $img.prependTo($a);
                  });
              },
              "text"
            );
          }
        );
      }
    });
    $($h6).on("click", function() {
      $(".people-text").toggle("slow");
    });
  }

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
};

var displayMarker = function(marker) {
  if (selected_marker) {
    selected_marker.setIcon(
      "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
    );
    selected_marker.setAnimation(null);
  }
  marker.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
  marker.setAnimation(google.maps.Animation.BOUNCE);
  selected_marker = marker;
  map.setCenter(marker.getPosition());
};

var clearMap = function() {
  all_markers.forEach(function(marker, i) {
    marker.setMap(null);
  });
};

var chooseStreets = function() {
  clearBuildings();
  clearMap();
  selected_marker = null;
  renderStreets();
};

var chooseBuildings = function() {
  clearStreets();
  clearMap();
  selected_marker = null;
  renderBuildings();
  renderMarkers();
};

var clearStreets = function() {
  $(".streets").html("");
};

var clearBuildings = function() {
  $(".buildings").html("");
};
