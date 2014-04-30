'use strict';

/* Filters */

angular.module('kontrolyApp.filters', []).
  filter('split', function() {
    return function(input, splitChar) {
      return input.split(splitChar);
    }
  });
