var map, heatMap;
var hitMarkers = [];
var dataPoints = [];
var playersList = [];
var targetResult = {}


$(document).ready(function(){
  initMap();
  var name = "Hello, "+getCookie("fName")
  var url = "http://private-f462a-appsassins.apiary-mock.com/currentGame";
  $("#profileButton").text(name)

  $.ajax(url, {
    method: "POST",
    dataType: "json",
    data: {email: getCookie("email")},
    success: function(json) {
      setCookie("gameMaster", json['user']['gameMaster']);
      setCookie("gameStatus", json['gameStatus']);
      if (json['gameStatus'] == 1) {
        $('#gStatus').text('Game Status: Waiting on Start')
      }
      else if (json['gameStatus'] == 0) {
        $('#gStatus').text('Game Status: Waiting on Confirms')
      }
      else {
        $('#gStatus').text('Game Status: Began')
      }

      setLocations(json['locations']);
      setGameList(json['players']);
      setUserSpecific();
    },
    error: function(json) {
      swal({title: "request failed -- you suck doc ready",
          type: "warning",
          confirmButtonColor: "#9E332D",
          confirmButtonText: "OK"
        });
      }
  });
});
function initMap() {
    var mapOptions = {
          center: { lat: 32.842539, lng: -96.782461},
          zoom: 15
      };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

}

$('#moresettings').click(function() {
  if($('#rightsidebar').css('display') == 'none') {
    $('#rightsidebar').show();
  }
  else {
    $('#rightsidebar').hide();
  }
});

$("#logoutButton").click(function() {
    swal({title: "You have logged out.", type:"success", confirmButtonColor:"#9E332D", confirmButtonText: "OK"});
	//enter test for correct username and password
  delete_cookie('fName');
  delete_cookie('email');
  delete_cookie('gameMaster');
  delete_cookie('gameStatus');
	window.setTimeout(function(){window.location.href='index.html';},1000);
});

$('#callStatistics').click(function(){
  dismissRight();
  if($('#gamesidebar').css('display') == 'none') {
    $('#gamesidebar').show();
  }
  else {
    $('#gamesidebar').hide();
  }
});

$('#callHeat').click(function(){

  if ($('#callHeat').text() == "View Heat Map") {
    heatMap.setMap(map);
    $('#callHeat').text("View Marker Map");
    hitMarkers.forEach(function(marker){
      marker.setMap(null);
    });
  }
  else {
    heatMap.setMap(null);
    hitMarkers.forEach(function(marker){
      $('#callHeat').text("View Heat Map");
      marker.setMap(map);
    });
  }

});

function dismissRight() {
  $('#rightsidebar').hide();
}

function dismissLeft() {
  $('#gamesidebar').hide();
}

function setLocations(locs) {
  for (var i = 0; i < locs.length; i++) {
    var pos = new google.maps.LatLng(locs[i]["lat"], locs[i]["lng"]);
    var marker = new google.maps.Marker({position: locs[i], map:map, title: "Dead"});
    hitMarkers.push(marker);
    dataPoints.push(pos);
  }

  heatMap = new google.maps.visualization.HeatmapLayer({
    data: dataPoints
  });
}

function setGameList(players) {
  var html = $('#players').html();
  for (var i = 0; i< players.length; i++) {
    playersList.push(players[i]["Player"])
    html += '<li><a>';
    if(players[i]["Alive"] == 0) {
      html += '<span class="glyphicon glyphicon-remove-sign"></span> ';
      html += players[i]["Player"];
      html += ": Tagged";
    }
    else {html += players[i]["Player"];}
    html += '</a></li>';
  }
  $('#players').html(html);
}

//different commands for GM and players
function setUserSpecific() {
  if (getCookie('gameMaster')==0) {
    $("#generator").text("View Target");
    $("#startGame").text("OK");
    $("#targets .modal-title").text("Your Target:");
  }
}

function generateTargets() {
  var possible = playersList.slice(0);
  for(var i = 0; i < playersList.length; i++) {
    var player = playersList[i];
    var index = possible.indexOf(player);
    if (index != -1) {possible.splice(index,1);} //remove current player from pool of possible targets
    var targeti = Math.floor(Math.random() * possible.length);
    while (targetResult[possible[targeti]] == player){ //check to see if you are targetting your hunter
      if (possible.length <= 1) {
        return false; //failed to generate good enough list
      }

      targeti = Math.floor(Math.random() * possible.length);
      console.log(targeti);
    }
    targetResult[player] = possible[targeti];
    possible.splice(targeti,1); //remove target from pool
    if (index != -1) {possible.push(player);} //add current player back in pool
  }
  return true;
}

$("#generator").click(function(){
  //if game has not begun generate targets
  //do a check for circular target
  var url = "http://private-f462a-appsassins.apiary-mock.com/gameStatus";
  if (getCookie('gameMaster') == 1 && getCookie('gameStatus') == 1) {
    var tryGenerate = generateTargets();
    while(!tryGenerate) { //run until successfully generated good target list
      tryGenerate = generateTargets();
    }
    console.log(targetResult);
    var text = "";
    for (var player in targetResult) {
        if (targetResult.hasOwnProperty(player)) {
           text += player + " targets " + targetResult[player] + "<br>";
        }
    }
    $("#targets .modal-body").html(text);
  }

  //if game master show all of the targets
  else if (getCookie('gameStatus') == 2) {
    if (getCookie('gameMaster') == 1) {
      //ajax for gameMaster, all targets
      var url = "http://private-f462a-appsassins.apiary-mock.com/allTargets";
      $.ajax(url, {
        method: "POST",
        dataType: "json",
        data: {'email': 'spanky@smu.edu'},
        success: function(json) {
          var text = "";
          for (var player in json) {
              if (json.hasOwnProperty(player)) {
                 text += player + " targets " + json[player] + "<br>";
              }
          }
          $("#targets .modal-body").html(text);
          $("#startGame").hide();
          $("#targets .modal-title").text("View Targets:");
        },
        error: function(json) {console.log('getting all targets failed')}
      });
    }
    else {
      //ajax for one target
      var url = "http://private-f462a-appsassins.apiary-mock.com/playerTarget";
      $.ajax(url, {
        method: "POST",
        dataType: "json",
        data: {'email': 'spanky@smu.edu'},
        success: function(json) {
          var text = json['target'];
          $("#targets .modal-body").html(text);
          $("#startGame").hide();
        },
        error: function(json) {console.log('getting one target failed')}
      });
    }
  }
  //else show single target
});

$("#beginGame").click(function() {
	var url = "http://private-f462a-appsassins.apiary-mock.com/newGame";
  emails = document.getElementById("inputFriends").value;
  emails = emails.split(/;\s*/);
  //console.log(emails);
	$.ajax(url, {
    method: "POST",
    dataType: "json",
    data: {user: getCookie('email'),
		   name: document.getElementById('gameName').value,
		   emails: emails}, //document.getElementById("inputFriends").value},
    success: function(json) {
      swal({title: "Game Invites Sent!",
          type: "success",
          timer: 1000,
          confirmButtonColor: "#9E332D",
          confirmButtonText: "OK"
        });
    },
    error: function(json) {
      swal({title: "request failed -- you suck",
          type: "warning",
          confirmButtonColor: "#9E332D",
          confirmButtonText: "OK"
        });
      }
  });
});

$('#startGame').click(function(){

  gStatus = getCookie('gameStatus');
  if (getCookie('gameMaster') == 1 && gStatus == 1) {
    //send db list of targets
    var url1 = "http://private-f462a-appsassins.apiary-mock.com/postTargets";
    $.ajax(url1, {
      method: "POST",
      data: targetResult,
      dataType: "json",
      success: function(json) {
        console.log(json['status']);

      },
      error: function(json) {
        console.log('you suck');
      }
    });

    //send db new game status
    var url2 = "http://private-f462a-appsassins.apiary-mock.com/gameStatus";
    $.ajax(url2, {
      method: "POST",
      data: {'gameStatus': 2},
      dataType: "json",
      success: function(json){
        setCookie('gameStatus', 2);
        swal({title: "Game Started!",
            type: "success",
            timer: 1000,
            confirmButtonColor: "#9E332D",
            confirmButtonText: "OK"
          });
        $('#gStatus').text('Game Status: Began');
      },
      error: function(json){console.log("game status setting failed to begin")}
    });
  }

});
