angular.module('fastpass.controllers', ['ionic', 'firebase'])

// need to implement loading feature
// .controller('LoadingCtrl', function($scope, $ionicLoading) {
//   $scope.show = function() {
//     $ionicLoading.show({
//       template: 'Loading...'
//     });
//   };
//   $scope.hide = function(){
//     $ionicLoading.hide();
//   };
// })

.controller('dashboardController', function($scope, authService) {

  var chatPartnerIds = [];
  var chatSessions = new Firebase('https://fastpass-connection.firebaseio.com/messages/' + authService.getUserId());
  console.log(chatSessions);
  chatSessions.on('value', function(snapshot) {
    var people = snapshot.val();
    console.log(snapshot.val());
    for (var key in people) {
      chatPartnerIds.push(key);
    }
    console.log(chatPartnerIds);
  });

  $scope.displayNameArray = [];
  for (var i = 0; i < chatPartnerIds.length; i++) {
    var current = chatPartnerIds[i];
    var chatSessions2 = new Firebase('https://fastpass-connection.firebaseio.com/users/' + current);

    // chatSessions2.on('value', function(snapshot) {
    //     var outtaIdeas = snapshot.val();
    //     console.log(outtaIdeas);
    //     for (var key in outtaIdeas) {
    //      $scope.displayNameArray.push(outtaIdeas[key]);
    //     }
    // });
  }
})

.controller('listController', function($scope, $state, $rootScope, listService) {
  $scope.text = listService;
   // getting object that we click on to see detailed view
   $scope.setMaster = function(section) {
    // setting this object on the rootscope so that we can access it in the detailed view
    $rootScope.selected = section;
    console.log($scope.selected);
  };
})

// couldn't get three way data binding to work :(
// .controller('listController', ['$scope', 'listService',
//   function($scope, service) {
//     service.$bind($scope, 'text');
//   }
// ])

.controller('offerController', function($scope, $firebase, formService, authService) {
  $scope.offer = {};
  // $scope properties for drop down menus
  $scope.rides = [
    'splash mountain',
    'space mountain',
    'big thunder mountain railroad',
    'buzz lightyear astro blasters',
    'haunted mansion',
    'indiana jones',
    'matterhorn bobsleds',
    'star tours'
  ];

  $scope.locations = [
    'current location: adventureland',
    'current location: critter country',
    'current location: fantasyland',
    'current location: frontierland',
    'current location: main street',
    'current loctation: mickey\'s toontown',
    'current location: new orleans square',
    'current location: tomorrowland'
  ];

  $scope.numbers_give = [
    '1 fastpass',
    '2 fastpasses',
    '3 fastpasses',
    '4 fastpasses',
    '5 fastpasses'
  ];

  $scope.comments = [
    'free',
    'trade',
  ];

  // set default properties for drop down menus
  $scope.offer.ride = $scope.rides[0];
  $scope.offer.location = $scope.locations[0];
  $scope.offer.number_give = $scope.numbers_give[0];
  $scope.offer.comment = $scope.comments[0];

  // when user submits an offer do this
  $scope.addOffer = function() {
    // set a createdAt property that is equal to the current date/time
    $scope.offer.createdAt = new Date();
    $scope.offer.offererId = authService.getUserId();
    $scope.offer.displayName = authService.getDisplayName();
    console.log($scope.offer.offererId);
    console.log($scope.offer.displayName);

    // get all offers from the database
    var offerRef = new Firebase('https://fastpass-connection.firebaseio.com/offers');
    // add new offer to the database
    $firebase(offerRef).$add($scope.offer);

    // add to user's offer hash
    var usersOffers = new Firebase('https://fastpass-connection.firebaseio.com/users/' + $scope.offer.offererId + '/offers');
    // add offer hash to logged in users offers hash
    $firebase(usersOffers).$add($scope.offer);

    // clear input fields of form
    $scope.offer = {
      // displayName: '',
      ride: '',
      number_give: '',
      location: '',
      comment: ''
    };
  };
})

.controller('detailController', function($scope, $firebase) {

})

.controller('connectionController', function($scope, $firebase, $rootScope, $ionicModal, authService, listService) {
  // handle messages to/from users
  $scope.comment = {
    text: ''
  };
  // if(map) {
  //   map.remove();
  // }
  // create map and properties
  var map = L.mapbox.map('map', 'jamesjsdev.io6o2ok3', {
    maxZoom: 18,
    dragging: true,
    touchZoom: true,
    tap: true,
    inertia: true
  });

  // find current location and watch it (track)
  map.locate({setView: true, watch: true, maxZoom: 16});
  // L.control.locate().addTo(map);
  
  // set user connected with to the marker location

  // reference user connected to
  // use $scope.selected.name when not using dummy info
  var connectedUser = "somebody else(user connecting with)";
  // get the lat and long from the database of the user you are connecting to
  var connectedUserLat = new Firebase('https://fastpass-connection.firebaseio.com/users/' + connectedUser + '/location/latitude');
  var connectedUserLng = new Firebase('https://fastpass-connection.firebaseio.com/users/' + connectedUser + '/location/longitude');

  connectedUserLat.on('value', function(snapshot) {
    $scope.connectedUserLat = snapshot.val();
  });

  connectedUserLng.on('value', function(snapshot) {
    $scope.connectedUserLng = snapshot.val();
  });
  
  // put marker on map of the user you are connecting to
  L.marker([$scope.connectedUserLat, $scope.connectedUserLng]).addTo(map);
 
  // intialize lat and long for onLocationFound function
  var latitude = 0;
  var longitude = 0;
  var nextCircles = false;

  var first = true;
  var onLocationFound = function (e) {
    console.log('latitude: ', e.latitude);
    console.log('longitude: ', e.longitude);
    console.log('latlng: ', e.latlng);
    //console.log($rootScope.selected.name);
    // represents presently logged in user
    var user = 'somebody(logged in user)';
    // create latitude and longitude parameters for logged in user
    var userLat = new Firebase('https://fastpass-connection.firebaseio.com/users/' + user + '/location/latitude');
    var userLng = new Firebase('https://fastpass-connection.firebaseio.com/users/' + user + '/location/longitude');
    // use set instead of add to overwrite any previous values
    $firebase(userLat).$set(e.latitude);
    $firebase(userLng).$set(e.longitude);
    // access properties of the locationfound event
    // latitude = e.latitude;
    // longitude = e.longitude;
    // var distance = e.latlng.distanceTo([latitude, longitude]);
    // console.log(distance);
    // create a circle for display
    // todo: make circle refresh when location changes
    // if (!nextCircles) {  
      var radius = e.accuracy / 2;
      if (first){
        me = L.circleMarker(e.latlng, radius);
        map.addLayer(me);
        first = false;
      } else{
        map.removeLayer(me);
        me = L.circleMarker(e.latlng, radius);
        map.addLayer(me);
      } 
      // nextCircles = true;
    // } else {
      // circle.update();
      // circle.removeFrom(map);
      // circle.setLatLng(e.latitude, e.longitude);
    // }
  };
 
   // event locationfound will trigger every time the user's position changes
   map.on('locationfound', onLocationFound);

  // unused modal functionality
//   $ionicModal.fromTemplateUrl('templates/my-modal.html', {
//     scope: $scope,
//     animation: 'slide-in-up'
//   }).then(function(modal) {
//     $scope.modal = modal;
//   });

//   $scope.openModal = function() {
//     $scope.modal.show();
//   };
//   $scope.closeModal = function() {
//     $scope.modal.hide();
//   };
//   //Cleanup the modal when we're done with it!
//   $scope.$on('$destroy', function() {
//     $scope.modal.remove();
//   });
//   // Execute action on hide modal
//   $scope.$on('modal.hidden', function() {
//     // Execute action
//   });
//   // Execute action on remove modal
//   $scope.$on('modal.removed', function() {
//     // Execute action
//   });

})

.controller('chatController', function($scope, $rootScope, $timeout, $firebase, listService, authService) {
  // initialize object for message contents
  $scope.comment = {};
  // the name associated with the selected offer
  $scope.to = $rootScope.selected.offererId;
  // current logged in user 'james'
  $scope.from = authService.getUserId();
  console.log('message from uid: ', $scope.from);
  console.log('message from display: ', authService.getDisplayName());
  console.log('message from provider: ', authService.getProvider());
  // $scope.from = "James";
  var messageRef = new Firebase('https://fastpass-connection.firebaseio.com/messages/' + $scope.from + '/' + $scope.to);
  var otherMessageRef = new Firebase('https://fastpass-connection.firebaseio.com/messages/' + $scope.to + '/' + $scope.from);

  messageRef.on('value', function(snapshot) {
    $scope.userMessages = snapshot.val();
  });

  $scope.sendComment = function() {
    $scope.comment.createdAt = new Date();
    $scope.comment.senderDisplayName = authService.getDisplayName();
    // add new message to the database
    // todo: refactor with transaction
    $firebase(messageRef).$add($scope.comment);

    $firebase(otherMessageRef).$add($scope.comment);

    $scope.comment.content = '';

    // todo: try to use modal for successful send of message
    // $scope.openModal();
  };
  
})

// log in user
.controller('loginController', function($scope, authService) {
  console.log("entering login controller");
  
  $scope.validateUser = function(type) {
    console.log("entering validate user");
    authService.login(type);
  };
})

// log out user
.controller('logoutController', function(authService) {
  console.log("entering logout controller");
  authService.logout();
})

.controller('HomeTabCtrl', function($scope) {
  console.log('HomeTabCtrl');
});
