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
        if (params.filter()[column] != '') filterparam.push(column + ':*' + (params.filter()[column].trim().replace(/\s+/, "* AND *")) + '*');
				//if (params.filter()[column] != '') filterparam.push(column + ':*' + (params.filter()[column]) + '*');
    }
			
		$http(
          {method: 'JSONP',
           url: 'http://ruian.linked.opendata.cz/solr/collection1/query',
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
	  '<p>Celkem: {{tableParams.total()}} řádek</p>' +
	  '<a class="btn btn-primary pull-right" ng-mousedown="csv.generate()" ng-href="{{csv.link()}}" download="kontroly.csv">Stáhnout výběr jako CSV</a>' +
      '<table ng-table="tableParams" show-filter="true" class="table" export-csv="csv"  template-pagination="custom/pager">'+
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
                    '<a target="_blank" href="{{check.sanctionResource}}">{{check.sanctionValue}}{{check.sanctionValue ? " CZK" : ""}}</a>'+
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
            '<td data-title="\'Mapa\'">'+
				'<span ng-bind-html="check.maphtml"></span>'+
			'</td>'+
          '</tr>'+
        '</tbody>'+
      '</table>'+
	  '<script type="text/ng-template" id="custom/pager">'+
        '<ul class="pager ng-cloak">'+
          '<li ng-repeat="page in pages"'+
           '     ng-class="{\'disabled\': !page.active, \'previous\': page.type == \'prev\', \'next\': page.type == \'next\'}"'+
           '     ng-show="page.type == \'prev\' || page.type == \'next\'" ng-switch="page.type">'+
           ' <a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo; Previous</a>'+
           ' <a ng-switch-when="next" ng-click="params.page(page.number)" href="">Next &raquo;</a>'+
          '</li>'+
           ' <li> '+
            '<div class="btn-group">'+
            '    <button type="button" ng-class="{\'active\':params.count() == 10}" ng-click="params.count(10)" class="btn btn-default">10</button>'+
            '    <button type="button" ng-class="{\'active\':params.count() == 25}" ng-click="params.count(25)" class="btn btn-default">25</button>'+
            '    <button type="button" ng-class="{\'active\':params.count() == 50}" ng-click="params.count(50)" class="btn btn-default">50</button>'+
            '    <button type="button" ng-class="{\'active\':params.count() == 100}" ng-click="params.count(100)" class="btn btn-default">100</button>'+
            '    <button type="button" ng-class="{\'active\':params.count() == 1000}" ng-click="params.count(1000)" class="btn btn-default">1000</button>'+
//            '    <button type="button" ng-class="{\'active\':params.count() == 99999999}" ng-click="params.count(99999999)" class="btn btn-default">&infin;</button>'+
            '</div>'+
            '</li>'+
        '</ul>'+
    '</script>'+	  
    '</div>'
	}
})
.directive('inspectionResultsMaps', function() {
	return {
		controller: function($scope, $timeout, $resource, $http, ngTableParams) {
	$scope.defaultZoom = 7;
	$scope.defaultCenter = {
		lat: 49.8037633,
		lng: 15.4749126
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
				if (params.filter()[column] != '') filterparam.push(column + ':*' + (params.filter()[column].trim().replace(/\s+/, "* AND *")) + '*');
				//if (params.filter()[column] != '') filterparam.push(column + ':*' + (params.filter()[column]) + '*');
    }
			
		$http(
          {method: 'JSONP',
           url: 'http://ruian.linked.opendata.cz/solr/collection1/query',
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
			  
              docs[i].coordinates = {
                lat: docs[i].lat,
                lng: docs[i].lng
              };
              docs[i].zoom = 14;
			  docs[i].maphtml = '<a target="_blank" href="http://maps.google.com/?ie=UTF8&q=' + docs[i].lat +','+docs[i].lng+'&ll='+docs[i].lat+','+docs[i].lng+'&z='+docs[i].zoom+'"><span class="glyphicon glyphicon-new-window"></span> Mapa</a>';
			  docs[i].title = docs[i].businessEntityName;
			  docs[i].description = 
				'<dl>' + 
				'<dt>' + docs[i].businessEntityName + '</dt>' +
				'<dd>' + docs[i].street + '<br/>' + docs[i].postalCode + ' ' + docs[i].locality + '<br/>' + docs[i].region + '</dd><br/>' +
				'<dt><a target="_blank" href="http://linked.opendata.cz/resource/business-entity/CZ'+docs[i].businessEntityID+'"><span class="glyphicon glyphicon-new-window"></span> ' + docs[i].businessEntityID + '</a></dt>' +
				'<dt><a target="_blank" href="http://linked.opendata.cz/resource/domain/coi.cz/check-action/' + docs[i].checkActionID + '"><span class="glyphicon glyphicon-new-window"></span> ' + docs[i].checkDate.substring(0,10) + '</a></dt>' +
				(docs[i].sanctionResource ? '<dt><a target="_blank" href="' + docs[i].sanctionResource + '"><span class="glyphicon glyphicon-new-window"></span> ' + docs[i].sanctionValue + ' CZK</a></dt>' : "" ) +
				(docs[i].agentResource ? '<dt><a target="_blank" href="' + docs[i].agentResource + '"><span class="glyphicon glyphicon-new-window"></span> ' + docs[i].agentResource + '</a></dt>' : "" ) +
				'</dl>'
			  ;
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
		'<gmaps class="bigmap" markers="data" center="defaultCenter" zoom="defaultZoom"></gmaps>' +
		//'<google-map class="bigmap" center="defaultCenter" zoom="defaultZoom">' +
		//	'<marker ng-repeat="marker in data" coords="marker.position" options="marker.options"></marker>' +
		//'</google-map>' +
	  'Celkem: {{tableParams.total()}} řádek' +
//	  ' Střed: {{center.lat}}, {{center.lng}}' +
      '<table ng-table="tableParams" show-filter="true" class="table" template-pagination="custom/pager">'+
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
                    '<a target="_blank" href="{{check.sanctionResource}}">{{check.sanctionValue}}{{check.sanctionValue ? " CZK" : ""}}</a>'+
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
            '<td data-title="\'Mapa\'">'+
			//	'<gmaps class="smallmap" markers="[check]" center="check.center" zoom="check.zoom"></gmaps>'+
			//				'<google-map center="check.center" zoom="check.zoom">' +
			//					'<marker coords="check.position"></marker>' +
			//				'</google-map>' +
				'<span ng-bind-html="check.maphtml"></span>'+
			'</td>'+
          '</tr>'+
        '</tbody>'+
      '</table>'+
		'<script type="text/ng-template" id="custom/pager">'+
        '<ul class="pager ng-cloak">'+
          '<li ng-repeat="page in pages"'+
           '     ng-class="{\'disabled\': !page.active, \'previous\': page.type == \'prev\', \'next\': page.type == \'next\'}"'+
           '     ng-show="page.type == \'prev\' || page.type == \'next\'" ng-switch="page.type">'+
           ' <a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo; Previous</a>'+
           ' <a ng-switch-when="next" ng-click="params.page(page.number)" href="">Next &raquo;</a>'+
          '</li>'+
           ' <li> '+
            '<div class="btn-group">'+
            '    <button type="button" ng-class="{\'active\':params.count() == 10}" ng-click="params.count(10)" class="btn btn-default">10</button>'+
            '    <button type="button" ng-class="{\'active\':params.count() == 25}" ng-click="params.count(25)" class="btn btn-default">25</button>'+
            '    <button type="button" ng-class="{\'active\':params.count() == 50}" ng-click="params.count(50)" class="btn btn-default">50</button>'+
            '    <button type="button" ng-class="{\'active\':params.count() == 100}" ng-click="params.count(100)" class="btn btn-default">100</button>'+
            '    <button type="button" ng-class="{\'active\':params.count() == 1000}" ng-click="params.count(1000)" class="btn btn-default">1000</button>'+
//            '    <button type="button" ng-class="{\'active\':params.count() == 99999999}" ng-click="params.count(99999999)" class="btn btn-default">&infin;</button>'+
            '</div>'+
            '</li>'+
        '</ul>'+
    '</script>'+
	  
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
})
.directive('gmaps', [function () {
	return {
		scope: {
			markerData: '=markers',
			mapType: '@',
			zoom: '=',
			center: '='
		},
		controller: function ($scope) {

			$scope._gMarkers = [];

			$scope.getTitle = function (item) {
				var t = "";
				if (item.title) {
					t += item.title;
				}
				return t;
			};

			$scope.updateMarkers = function () {

				angular.forEach($scope._gMarkers, function (m) {
					m.setMap(null);
				});

				$scope._gMarkers = [];

				angular.forEach($scope.markerData, function (item, k) {

					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(item.coordinates.lat, item.coordinates.lng),
						map: $scope.map,
						title: $scope.getTitle(item)
					});

					$scope._gMarkers.push(marker);

					//$scope.addVisibilityListener(item, marker);

					var contentString = '<p>' + item.description.replace(/\n/g, "<br />") + '</p>';

					google.maps.event.addListener(marker, 'click', function (content) {
						return function () {
							$scope.infowindow.setContent(content);//set the content
							$scope.infowindow.open($scope.map, this);
						}
					}(contentString));
				});
			};

			$scope.updateZoom = function () {
				$scope.map.setZoom($scope.zoom || 0);
			};

			$scope.updateCenter = function () {
				var center = $scope.center || {lat: 0, lng: 0};

				$scope.map.setCenter(new google.maps.LatLng(center.lat || 0, center.lng || 0));
			};

			$scope.$watch('markerData', function () {
				$scope.updateMarkers();
			});

			$scope.$watch('zoom', function () {
				$scope.updateZoom();
			});

			$scope.$watch('center', function () {
				$scope.updateCenter();
			});

		},
		link: function ($scope, $elm, $attrs) {

			var center = $scope.center || {lat: 0, lng: 0};

			$scope.map = new google.maps.Map($elm[0], {
				center: new google.maps.LatLng(center.lat, center.lng),
				zoom: parseInt($scope.zoom) || 0,
				mapTypeId: $scope.mapType || google.maps.MapTypeId.ROADMAP
			});

			$scope.infowindow = new google.maps.InfoWindow();
		},
		restrict: 'E',
		template: '<div class="gmaps"></div>',
		replace: true
	}
}]);