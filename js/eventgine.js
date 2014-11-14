var angular;

angular.module('eventgine', ['ngMaterial', 'eventgine.controllers', 'eventgine.services', 'ui.router'])
.config([
    '$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
        $stateProvider.state(
            'home', {
                url: '/',
                templateUrl: '/templates/home.html'
            }
        ).state(
            'login', {
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
            'main', {
                url: '/loggedin',
                templateUrl: '/templates/main.html',
                controller: 'MainCtrl as m'
            }
        );

        $locationProvider.html5Mode({
            enabled: true,
            rewriteLinks: false
        });

        $locationProvider.hashPrefix('!');
    }
]);

angular.module('eventgine.services', ['restangular'])
.config([
    'RestangularProvider', function(RestangularProvider) {
        RestangularProvider.setBaseUrl('http://test.api.eventgine.co');
        RestangularProvider.setDefaultHeaders({});
    }
])
.factory('ClientID', [
    '$window', 'Restangular',
    function($window, Restangular) {
        return function() {
            var client_id;

            client_id = $window.localStorage.getItem('ClientID');

            if (client_id) {
                return client_id;
            }

            clients = Restangular.all('clients');
            clients.post({
                "redirect_uri_list": [
                    "http://test.eventgine.co"
                ],
                "response_type": "token"
            }).then(function(response) {
                client_id = response.response.client_id;
                $window.localStorage.setItem('ClientID', client_id);
            });

            return client_id;
        };
    }
])
.factory('AccessToken', [
    '$window', '$state',
    function($window, $state) {
        return function() {
            var access_token = $window.localStorage.getItem('access_token');

            if (access_token) {
                return access_token;
            }

            $state.go('login');

        };
    }
]);
