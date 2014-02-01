angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider'], function($routeProvider, $locationProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'views/partials/home.html',
            controller: 'HomeController'
        });

    $locationProvider.html5Mode(true);
});
