'use strict';

/* Directives */

angular.module('InspectionsViewerApp.directives', [])
  .directive('inspectionsSearchResult', function() {
    return {
      template: '<div><ul class="list-group">' +
                '  <li ng-repeat="doc in results.docs" class="list-group-item">' +
                '    <a href="#/business-entities/{{doc[\'businessEntityID\']}}">{{doc["businessEntityName"]}} ({{doc["businessEntityID"]}})</a><br/>' +
                '  </li>' +
                '</ul></div>'
    }
  })
  .directive('inspectionsSearchTypeahead', function() {
    return {
      controller: function($scope, $http) {
        console.log('Typeahead controller start');
        $scope.getBEs = function(val) {
          if ( val != null && val.length > 2 )  {
            return $http(
              {method: 'JSONP',
               url: 'http://ruian.linked.opendata.cz:8080/solr/collection1/query',
               // @TODO : $scope.query should be inspected and escaped
               params:{'json.wrf': 'JSON_CALLBACK',
                      'q': 'businessEntityName:' + val + '* OR businessEntityID:' + val + '*',
                      'rows': '500000',
                      'fl': 'businessEntityName businessEntityID',
                      'group': 'true',
                      'group.field': 'businessEntityID',
                      'group.main': 'true'}
              }
            ).then(function(res) {
                var docs = res.data.response.docs;
                console.log('search success!');
                return docs;
              }
            );
          } else {
            return {docs: [], numFound: 0 };
          }
        };
      },
      template: '<form class="navbar-form navbar-left" role="search" action="#/business-entities">' +
                '  <div class="form-group">' +
				'    <input type="text" ng-model="asyncSelected" placeholder="Typeahead"' + '      typeahead="be.businessEntityID as (be.businessEntityID + \': \' + be.businessEntityName ) for be in getBEs($viewValue)"' + ' typeahead-loading="loadingLocations" class="form-control">' +
				' <i ng-show="loadingLocations" class="glyphicon glyphicon-refresh"></i>' +
                '  </div>' +
                '  <button type="submit" class="btn btn-default">Submit</button>' +
                '</form>'
    }  })
  .directive('inspectionsSearch', function() {
    return {
      controller: function($scope, $http) {
        console.log('Searching for ' + $scope.query);
        $scope.$watch('query', function() {
          if ( $scope.query != null && $scope.query.length > 2 )  {
            $http(
              {method: 'JSONP',
               url: 'http://ruian.linked.opendata.cz:8080/solr/collection1/query',
               // @TODO : $scope.query should be inspected and escaped
               params:{'json.wrf': 'JSON_CALLBACK',
                      'q': 'businessEntityName:' + $scope.query + '* OR businessEntityID:' + $scope.query + '*',
                      'rows': '500000',
                      'fl': 'businessEntityName businessEntityID',
                      'group': 'true',
                      'group.field': 'businessEntityID',
                      'group.main': 'true'}
              }
            ).success(function(data) {
                var docs = data.response.docs;
                console.log('search success!');
                $scope.results.docs = docs;
                $scope.results.numFound = data.response.numFound;
              }
            ).error(function() {
                console.log('Search failed!');
              }
            );
          } else {
            $scope.results = {docs: [], numFound: 0};
          }
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