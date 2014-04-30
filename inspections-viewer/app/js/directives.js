'use strict';

/* Directives */

angular.module('kontrolyApp.directives', [])
  .directive('kontrolyResult', function() {
    return {
      template: '<div><ul class="list-group">' +
                '  <li ng-repeat="doc in results.docs" class="list-group-item">' +
                '    <span>{{doc["businessEntityName"]}} ({{doc["businessEntityID"]}})</span><br/>'  +
                '    <span>Sankce {{doc["sanctionValue"]}} udělena dne {{doc["sanctionDate"]}}</span><br/>' +
                '    <span>Adresa: {{doc["street"]}}, {{doc["locality"]}}, {{doc["postalCode"]}}</span>' +
                '  </li>' +
                '</ul></div>'
    }
  })
  .directive('kontrolySearch', function() {
    return {
      controller: function($scope, $http) {
        console.log('Searching for ' + $scope.query);
        $scope.$watch('query', function() {
          $http(
            {method: 'JSONP',
             url: 'http://ruian.linked.opendata.cz:8080/solr/collection1/query',
             params:{'json.wrf': 'JSON_CALLBACK',
                    'q': $scope.query,
                    'rows': '500000',
                    'fl': 'businessEntityName businessEntityID sanctionValue sanctionDate street postalCode locality'}
            })
            .success(function(data) {
              var docs = data.response.docs;
              console.log('search success!');
              $scope.results.docs = docs;
              $scope.results.numFound = data.response.numFound;

            }).error(function() {
              console.log('Search failed!');
            });
        });
      },
      template: '<form class="navbar-form navbar-left" role="search">' +
                '  <div class="form-group">' +
                '    <input ng-model="query" type="text" class="form-control" placeholder="Search">' +
                '  </div>' +
                '  <button type="submit" class="btn btn-default">Submit</button>' +
                '</form>'
    }
  })

/*angular.module('kontrolyApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('kontroly', function ()  {
    return {
      template: '<p>{{scope.query}}</p>' +
                '<p ng-repeat="doc in scope.results.docs">' +
                '  <span>{{doc["businessEntityName"]}} ({{doc["businessEntityID"]}})</span><br/>'  +
                '  <span>Sankce {{doc["sanctionValue"]}} udělena dne {{doc["sanctionDate"]}}</span><br/>' +
                '  <span>Adresa: {{doc["street"]}}, {{doc["locality"]}}, {{doc["postalCode"]}}</span>' +
                '</p>'
    }
  })
  .directive('kontrolySearch', function () {
    return {
      scope: {
        solrUrl: '@',
        query: '@',
        results: '&'
      },
      restrict: 'E',
      controller: function($scope, $http) {
        console.log('Searching for ' + $scope.query + ' at ' + $scope.solrUrl);
        $scope.$watch('query', function() {
          $http(
            {method: 'JSONP',
             url: $scope.solrUrl,
             params:{'json.wrf': 'JSON_CALLBACK',
                    'q': $scope.query,
                    'rows': '500000',
                    'fl': 'businessEntityName businessEntityID sanctionValue sanctionDate street postalCode locality'}
            })
            .success(function(data) {
              var docs = data.response.docs;
              console.log('search success!');
              $scope.results.docs = docs;
              $scope.results.numFound = data.response.numFound;

            }).error(function() {
              console.log('Search failed!');
            });
        });
      },
      template: '<form class="navbar-form navbar-left" role="search">' +
                '  <div class="form-group">' +
                '    <input ng-model="query" type="text" class="form-control" placeholder="Search">' +
                '  </div>' +
                '  <button type="submit" class="btn btn-default">Submit</button>' +
                '</form>'
    };
  })*/
  
/*angular.module('kontrolyApp.directives', []).
  directive('kontrolySearch', function () {
    return {
      scope: {
        solrUrl: '@',
        query: '@',
        results: '&'
      },
      restrict: 'E',
      controller: function($scope, $http) {
        console.log('Searching for ' + $scope.query + ' at ' + $scope.solrUrl);
        $scope.$watch('query', function() {
          $http(
            {method: 'JSONP',
             url: $scope.solrUrl,
             params:{'json.wrf': 'JSON_CALLBACK',
                    'q': $scope.query,
                    'rows': '500000',
                    'fl': 'businessEntityName businessEntityID sanctionValue sanctionDate street postalCode locality'}
            })
            .success(function(data) {
              var docs = data.response.docs;
              console.log('search success!');
              $scope.results.docs = docs;
              $scope.results.numFound = data.response.numFound;

            }).error(function() {
              console.log('Search failed!');
            });
        });
      },
      template: '<input ng-model="query" name="Search"></input>' +
                '<h2>Search Results for {{query}} ({{results.numFound}} in total)</h2>' +
                '<p ng-repeat="doc in results.docs">' +
                '  <span>{{doc["businessEntityName"]}} ({{doc["businessEntityID"]}})</span><br/>'  +
                '  <span>Sankce {{doc["sanctionValue"]}} udělena dne {{doc["sanctionDate"]}}</span><br/>' +
                '  <span>Adresa: {{doc["street"]}}, {{doc["locality"]}}, {{doc["postalCode"]}}</span>' +
                '</p>'
    };
  })*/
