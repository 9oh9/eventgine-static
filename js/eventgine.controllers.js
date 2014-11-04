var angular, URI;

angular.module('eventgine.controllers', ['restangular', 'eventgine.services'])
.config([
    'RestangularProvider', function(RestangularProvider) {
        RestangularProvider.setBaseUrl('http://test.api.eventgine.co');
        RestangularProvider.setDefaultHeaders({});
    }
])
.controller('LoginCtrl', [
    '$scope', '$window', 'Restangular', 'ClientID',
    function($scope, $window, Restangular, ClientID) {

        var interval_id = $window.setInterval(function() {
            console.log(ClientID());
            if (ClientID()) {
                $window.clearInterval(interval_id);
            }
        }, 1000);

        $scope.login = function() {

            var urlEncodedDataPairs = [];
            var data = {
                "eventgine-email": $scope.email,
                "eventgine-password": $scope.password,
                "eventgine-response-type": 'token',
                "eventgine-auth-scope": 'user',
                "eventgine-request-state": 'boobs',
                "eventgine-client-id": '5be959b2f89a5ceb6f35b0eadb48415a',
                "eventgine-redirect-uri": 'http://test.eventgine.co/loggedin'
            };

            // We turn the data object into an array of URL encoded key value pairs.
            for (var name in data) {
                urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
            }

            // We combine the pairs into a single string and replace all encoded spaces to
            // the plus character to match the behaviour of the web browser form submit.
            var urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

            console.log('In login!');
            console.log($scope.email, $scope.password);

            Restangular.oneUrl('authorizations')
            .withHttpConfig({transformRequest: angular.identity})
            .customPOST(
                urlEncodedData,
                undefined,
                undefined,
                {'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8"}
            )
            .then(function(response) {
                console.log(response.response.Location);
                $window.location.href = response.response.Location;
            });
        };
    }
])
.controller('MainCtrl', [
    '$scope', '$window',
    function($scope, $window) {
        var access_token = URI.parseQuery($window.location.hash.replace('#', '?')).access_token;
        console.log(access_token);
        $scope.access_token = access_token;
    }
]);
