var angular, URI;

angular.module('eventgine.controllers', ['restangular', 'eventgine.services'])
.config([
    'RestangularProvider', function(RestangularProvider) {
        RestangularProvider.setBaseUrl('http://test.api.eventgine.co');
        RestangularProvider.setDefaultHeaders({});
    }
])
.controller('LoginCtrl', [
    '$scope', '$window', 'Restangular', 'ClientID', 'ImplicitGrant',
    function($scope, $window, Restangular, ClientID, ImplicitGrant) {

        var interval_id = $window.setInterval(function() {
            if (ClientID()) {
                $window.clearInterval(interval_id);
            }
        }, 1000);


        console.log("ImplicitGrant", ImplicitGrant());

        $scope.login = function() {

            var urlEncodedDataPairs = [];


            var data = {
                "eventgine-email": $scope.email,
                "eventgine-password": $scope.password,
                "eventgine-response-type": ImplicitGrant().response_type || 'token',
                "eventgine-auth-scope": ImplicitGrant().scope ||  'user',
                "eventgine-request-state": ImplicitGrant().state || 'boobs',
                "eventgine-client-id": ImplicitGrant().client_id || $window.localStorage.getItem('ClientID'),
                "eventgine-redirect-uri": ImplicitGrant().redirect_uri || 'http://test.eventgine.co/loggedin'
            };

            // We turn the data object into an array of URL encoded key value pairs.
            for (var name in data) {
                urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
            }

            // We combine the pairs into a single string and replace all encoded spaces to
            // the plus character to match the behaviour of the web browser form submit.
            var urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

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
                var redirect = new URI(response.response.Location);
                var next = new URI.parseQuery($window.location.search).next;
                if(redirect.domain() == $window.location.hostname && next){
                  $window.location.href = redirect.toString() + '&next=' + next;
                }
                else {
                  $window.location.href = response.response.Location;
                }
            });
        };
    }
])
.controller('RegisterCtrl', [
    '$scope', '$window', 'Restangular', 'ClientID',
    function($scope, $window, Restangular, ClientID) {

        var access_token = '';

        $scope.register = function() {
            Restangular.all('users')
            .post({
                name: $scope.name,
                email: $scope.email,
                password: $scope.password
            }).then(function(data){
              console.log(data);
            });
        };

    }
])
.controller('LoggedInCtrl', [
    '$scope', '$window', 'AccessToken', '$state',
    function($scope, $window, AccessToken, $state) {
        var queryObj = URI.parseQuery($window.location.hash.replace('#', '?'));
        var access_token = AccessToken(queryObj.access_token);

        if(queryObj.next){
          $state.go(queryObj.next);
        }
        else{
          $state.go('dash');
        }
      }
])
.controller('DashCtrl', [
    '$scope', '$state', '$window', 'Restangular',
    function($scope, $state, $window, Restangular){

    }
]);
