'use strict';

/* Directives */

angular.module('InspectionsViewerApp.directives', [])
/*  .directive('inspectionsSearchResult', function() {
    return {
      template: '<div><ul class="list-group">' +
                '  <li ng-repeat="doc in results.docs" class="list-group-item">' +
                '    <a href="#/business-entities/{{doc[\'businessEntityID\']}}">{{doc["businessEntityName"]}} ({{doc["businessEntityID"]}})</a><br/>' +
                '  </li>' +
                '</ul></div>'
    }
  })*/
/*  .directive('inspectionsSearchTypeahead', function() {
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
    }  
})*/
/*  .directive('inspectionsSearch', function() {
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
  })*/
.directive('inspectionResultsTable', function() {
	return {
		controller: function($scope, $timeout, $resource, $http, ngTableParams) {
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,          // count per page
		filterDelay: 1500,
        sorting: {
            checkDate: 'desc'     // initial sorting
        }
    }, {
        total: 0,           // length of data
        getData: function($defer, params) {
		
		var sortparam = '';
		for (var column in params.sorting()) {
                if (sortparam != '') sortparam += ',';
				sortparam += column + ' ' + (params.sorting()[column]);
            }
		
		var filterparam = [];
		for (var column in params.filter()) {
				if (params.filter()[column] != '') filterparam.push(column + ':*' + (params.filter()[column]) + '*');
            }
			
		$http(
          {method: 'JSONP',
           url: 'http://ruian.linked.opendata.cz:8080/solr/collection1/query',
           params:{'json.wrf': 'JSON_CALLBACK',
                  'q': '*:*',
                  'start': (params.page() - 1) * params.count(),
				  'rows': params.count(),
				  'sort': sortparam,
				  'fq': filterparam
				  }
          }
        ).success(function(data) {
			var docs = data.response.docs;
            console.log('search success!');
            params.total(data.response.numFound);
			
			for (var i = 0; i < docs.length; i++)  {
              if (docs[i].lat) {
				  docs[i].zoom = 14;
				  docs[i].maphtml = '<a target="_blank" href="http://maps.google.com/?ie=UTF8&q=' + docs[i].lat +','+docs[i].lng+'&ll='+docs[i].lat+','+docs[i].lng+'&z='+docs[i].zoom+'"><span class="glyphicon glyphicon-new-window"></span> Mapa</a>';
			  }
            }
			$defer.resolve(docs);
          }
        ).error(function() {
            console.log('Search failed!');
          }
        );
        }
    });
	},
	template: '<div loading-container="tableParams.settings().$loading">'+
	  'Celkem: {{tableParams.total()}} řádek' +
      '<table ng-table="tableParams" show-filter="true" class="table">'+
        '<tbody>'+
          '<tr ng-repeat="check in $data">'+
            //'<td data-title="\'Kontrola\'" filter="{ \'checkActionID\': \'text\' }" sortable="checkActionID">'+
            //        '<a target="_blank" href="http://linked.opendata.cz/resource/domain/coi.cz/check-action/{{check.checkActionID}}">{{check.checkActionID}}</a>'+
			//'</td>'+
            '<td data-title="\'Datum kontroly\'" sortable="checkDate" filter="{ \'checkDate\': \'text\' }">'+
                    '<a target="_blank" href="http://linked.opendata.cz/resource/domain/coi.cz/check-action/{{check.checkActionID}}"><span class="glyphicon glyphicon-new-window"></span> {{check.checkDate.substring(0,10)}}</a>'+
			'</td>'+
            '<td data-title="\'IČ\'" filter="{ \'businessEntityID\': \'text\' }" sortable="businessEntityID">'+
                    '<a target="_blank" href="http://linked.opendata.cz/resource/business-entity/CZ{{check.businessEntityID}}"><span class="glyphicon glyphicon-new-window"></span> {{check.businessEntityID}}</a>'+
			'</td>'+
            '<td data-title="\'Jméno subjektu\'" filter="{ \'businessEntityName\': \'text\' }" sortable="businessEntityName">'+
                    '{{check.businessEntityName}}'+
			'</td>'+
            '<td data-title="\'Sankce\'" sortable="sanctionValue">'+
                    '{{check.sanctionValue}}{{check.sanctionValue ? " CZK" : ""}}'+
			'</td>'+
            '<td data-title="\'Kontrolní orgán\'" >'+
                    '<a target="_blank" href="{{check.agentResource}}"><span class="glyphicon glyphicon-new-window"></span> {{check.agentResource}}</a>'+
			'</td>'+
            '<td data-title="\'Ulice\'" sortable="street" filter="{ \'street\': \'text\' }">'+
                    '{{check.street}}'+
			'</td>'+
            '<td data-title="\'Město\'" sortable="locality" filter="{ \'locality\': \'text\' }">'+
                    '{{check.locality}}'+
			'</td>'+
            '<td data-title="\'Kraj\'" sortable="region" filter="{ \'region\': \'text\' }">'+
                    '{{check.region}}'+
			'</td>'+
            '<td data-title="\'PSČ\'" sortable="postalCode" filter="{ \'postalCode\': \'text\' }">'+
                    '{{check.postalCode}}'+
			'</td>'+
            '<td class="smallmap" data-title="\'Mapa\'">'+
				'<span ng-bind-html="check.maphtml"></span>'+
			'</td>'+
          '</tr>'+
        '</tbody>'+
      '</table>'+
    '</div>'
	}
})
.directive('inspectionResultsMaps', function() {
	return {
		controller: function($scope, $timeout, $resource, $http, ngTableParams) {
	$scope.defaultZoom = 7;
	$scope.defaultCenter = {
		latitude: 49.8037633,
		longitude: 15.4749126
	};    
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,          // count per page
		filterDelay: 1500,
        sorting: {
            checkDate: 'desc'     // initial sorting
        }
    }, {
        total: 0,           // length of data
        getData: function($defer, params) {
		
		var sortparam = '';
		for (var column in params.sorting()) {
                if (sortparam != '') sortparam += ',';
				sortparam += column + ' ' + (params.sorting()[column]);
            }
		
		var filterparam = [];
		for (var column in params.filter()) {
				if (params.filter()[column] != '') filterparam.push(column + ':*' + (params.filter()[column]) + '*');
            }
			
		$http(
          {method: 'JSONP',
           url: 'http://ruian.linked.opendata.cz:8080/solr/collection1/query',
           params:{'json.wrf': 'JSON_CALLBACK',
                  'q': '*:*',
                  'start': (params.page() - 1) * params.count(),
				  'rows': params.count(),
				  'sort': sortparam,
				  'fq': filterparam
				  }
          }
        ).success(function(data) {
			var docs = data.response.docs;
            console.log('search success!');
            params.total(data.response.numFound);
			
			for (var i = 0; i < docs.length; i++)  {
              docs[i].center = {
                latitude: docs[i].lat,
                longitude: docs[i].lng
              };
              docs[i].position = {
                latitude: docs[i].lat,
                longitude: docs[i].lng
              };
              docs[i].zoom = 14;
			  docs[i].maphtml = '<a target="_blank" href="http://maps.google.com/?ie=UTF8&q=' + docs[i].lat +','+docs[i].lng+'&ll='+docs[i].lat+','+docs[i].lng+'&z='+docs[i].zoom+'"><span class="glyphicon glyphicon-new-window"></span> Větší mapa</a>';
			  docs[i].options = {
				title: docs[i].businessEntityName
			  };
            }
			$scope.data = docs;
			$defer.resolve(docs);
          }
        ).error(function() {
            console.log('Search failed!');
          }
        );
        }
    });
	},
	template: '<div loading-container="tableParams.settings().$loading">'+
		'<google-map class="bigmap" center="defaultCenter" zoom="defaultZoom">' +
			'<marker ng-repeat="marker in data" coords="marker.position" options="marker.options"></marker>' +
		'</google-map>' +
	  'Celkem: {{tableParams.total()}} řádek' +
      '<table ng-table="tableParams" show-filter="true" class="table">'+
        '<tbody>'+
          '<tr ng-repeat="check in $data">'+
            //'<td data-title="\'Kontrola\'" filter="{ \'checkActionID\': \'text\' }" sortable="checkActionID">'+
            //        '<a target="_blank" href="http://linked.opendata.cz/resource/domain/coi.cz/check-action/{{check.checkActionID}}">{{check.checkActionID}}</a>'+
			//'</td>'+
            '<td data-title="\'Datum kontroly\'" sortable="checkDate" filter="{ \'checkDate\': \'text\' }">'+
                    '<a target="_blank" href="http://linked.opendata.cz/resource/domain/coi.cz/check-action/{{check.checkActionID}}"><span class="glyphicon glyphicon-new-window"></span> {{check.checkDate.substring(0,10)}}</a>'+
			'</td>'+
            '<td data-title="\'IČ\'" filter="{ \'businessEntityID\': \'text\' }" sortable="businessEntityID">'+
                    '<a target="_blank" href="http://linked.opendata.cz/resource/business-entity/CZ{{check.businessEntityID}}"><span class="glyphicon glyphicon-new-window"></span> {{check.businessEntityID}}</a>'+
			'</td>'+
            '<td data-title="\'Jméno subjektu\'" filter="{ \'businessEntityName\': \'text\' }" sortable="businessEntityName">'+
                    '{{check.businessEntityName}}'+
			'</td>'+
            '<td data-title="\'Sankce\'" sortable="sanctionValue">'+
                    '{{check.sanctionValue}}{{check.sanctionValue ? " CZK" : ""}}'+
			'</td>'+
            '<td data-title="\'Kontrolní orgán\'" >'+
                    '<a target="_blank" href="{{check.agentResource}}"><span class="glyphicon glyphicon-new-window"></span> {{check.agentResource}}</a>'+
			'</td>'+
            '<td data-title="\'Ulice\'" sortable="street" filter="{ \'street\': \'text\' }">'+
                    '{{check.street}}'+
			'</td>'+
            '<td data-title="\'Město\'" sortable="locality" filter="{ \'locality\': \'text\' }">'+
                    '{{check.locality}}'+
			'</td>'+
            '<td data-title="\'Kraj\'" sortable="region" filter="{ \'region\': \'text\' }">'+
                    '{{check.region}}'+
			'</td>'+
            '<td data-title="\'PSČ\'" sortable="postalCode" filter="{ \'postalCode\': \'text\' }">'+
                    '{{check.postalCode}}'+
			'</td>'+
            '<td class="smallmap" data-title="\'Mapa\'">'+
				'<google-map center="check.center" zoom="check.zoom">' +
					'<marker coords="check.position"></marker>' +
				'</google-map>' +
				'<span ng-bind-html="check.maphtml"></span>'+
			'</td>'+
          '</tr>'+
        '</tbody>'+
      '</table>'+
    '</div>'
	}
})
.directive('loadingContainer', function () {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var loadingLayer = angular.element('<div class="loading"></div>');
            element.append(loadingLayer);
            element.addClass('loading-container');
            scope.$watch(attrs.loadingContainer, function(value) {
                loadingLayer.toggleClass('ng-hide', !value);
            });
        }
    };
});