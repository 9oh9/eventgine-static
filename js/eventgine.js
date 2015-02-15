var angular, URI;

angular.module('eventgine', ['ngMaterial', 'eventgine.controllers', 'eventgine.services', 'ui.router'])
.config([
    '$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
        $stateProvider.state(
            'home', {
                url: '/',
                templateUrl: '/templates/home.html'
            }
        ).state( 'login', {
                url: '/login',
                templateUrl: '/templates/login.html',
                controller: 'LoginCtrl as l'
            }
        ).state(
            'register', {
                url: '/register',
                templateUrl: '/templates/register.html',
                controller: 'RegisterCtrl as r'
            }
        ).state(
            'loggedin', {
                url: '/loggedin',
                templateUrl: '/templates/main.html',
                controller: 'LoggedInCtrl as li'
            }
        ).state(
            'dash', {
                url: '/dash',
                templateUrl: '/templates/dash.html',
                controller: 'DashCtrl as d'
            }
        );

        $locationProvider.html5Mode({
            enabled: true,
            rewriteLinks: false
        });

        $locationProvider.hashPrefix('!');
    }
])
.run(['$window', 'ClientID', '$rootScope', 'AccessToken',
    function($window, ClientID, $rootScope, AccessToken){

    var interval_id = $window.setInterval(function() {
      if (ClientID()) {
          $window.clearInterval(interval_id);
      }
    }, 1000);

    $rootScope.$on('unauthorized', function(ev, data){
        console.log('Unauthorized request occured!');
        AccessToken(null).finally(function(data){
          console.log('Access Token was revoked');
        });
    });

}]);

angular.module('eventgine.services', ['restangular'])
.config([
    'RestangularProvider', function(RestangularProvider) {
        RestangularProvider.setBaseUrl('http://test.api.eventgine.co');
        RestangularProvider.setDefaultHeaders({});
    }
])
.factory('ClientID', [
    '$window', 'Restangular', '$q',
    function($window, Restangular, $q) {
        return function() {
            var client_id;

            client_id = $window.localStorage.getItem('ClientID');

            if (client_id) {
                return client_id;
            }

            clients = Restangular.all('clients');
            clients.post({
                "redirect_uri_list": [
                    "http://test.eventgine.co/loggedin"
                ],
                "response_type": "token"
            }).then(function(response) {
                client_id = response.response.client_id;
                $window.localStorage.setItem('ClientID', client_id);
                return client_id;
            });
        };
    }
])
.factory('AccessToken', [
    '$window', '$state', '$q',
    function($window, $state, $q) {
        return function(token) {
          var deferred = $q.defer();
          if(token == null){
            $window.localStorage.removeItem('access_token');
            $state.go('login');
            deferred.reject(null);
          }
          else if(token == undefined){
            var access_token = $window.localStorage.getItem('access_token');

            if (access_token) {
              deferred.resolve(access_token);
            }
            $state.go('login');
            deferred.reject(null);
          }
          else {
            $window.localStorage.setItem('access_token', token);
            deferred.resolve(access_token);
          }
          return deferred.promise
        };
    }
])
.factory('ImplicitGrant', [
    '$window',
    function($window) {
        return function() {
          this.redirect_uri;
          this.response_type;
          this.scope;
          this.client_id;
          this.state;

          return {
            redirect_uri: this.redirect_uri || (this.redirect_uri = URI.parseQuery($window.location.search).redirect_uri),
            response_type: this.response_type || (this.response_type = URI.parseQuery($window.location.search).response_type),
            scope: this.scope || (this.redirect_uri = URI.parseQuery($window.location.search).scope),
            client_id: this.client_id || (this.client_id = URI.parseQuery($window.location.search).client_id),
            state: this.state || (this.state = URI.parseQuery($window.location.search).state)
          }
        }
    }
]);

