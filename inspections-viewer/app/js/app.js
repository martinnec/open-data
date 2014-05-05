'use strict';

// Declare app level module which depends on filters, and services
angular.module('InspectionsViewerApp', [
  'ngRoute', 'google-maps','ngResource','ngTable', 
  'InspectionsViewerApp.filters',
  'InspectionsViewerApp.services',
  'InspectionsViewerApp.directives',
  'InspectionsViewerApp.controllers',
  'ui.bootstrap'
])
.config(['$routeProvider', '$locationProvider',
  function($routeProvider,$locationProvider)  {
    $routeProvider.
      when('/', {
        templateUrl: 'app/partials/home.html',
        controller: 'HomeController'      
      }).
      when('/business-entities/:businessEntityID', {
        templateUrl: 'app/partials/business-entity-detail.html',
        controller: 'BusinessEntityDetailController'
      }).
      otherwise({
        redirectTo: '/'
      });
	  
	  $locationProvider.html5Mode(true);
  }
]);
