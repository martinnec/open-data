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
.config(['$routeProvider',
  function($routeProvider)  {
    $routeProvider.
      when('/home', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'      
      }).
      when('/business-entities/:businessEntityID', {
        templateUrl: 'partials/business-entity-detail.html',
        controller: 'BusinessEntityDetailController'
      }).
      otherwise({
        redirectTo: '/home'
      });
  }
]);