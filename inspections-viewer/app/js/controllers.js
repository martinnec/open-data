'use strict';

/* Controllers */

angular.module('kontrolyApp.controllers', [])
  .controller('kontroly', ['$scope', function($scope) {
    $scope.query = '';
    $scope.results = [];
  }]);
