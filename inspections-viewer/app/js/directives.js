'use strict';

/* Directives */

angular.module('InspectionsViewerApp.directives', [])
.directive('inspectionResultsTable', function() {
	return {
		controller: function($scope, $timeout, $resource, $http, $window, $location, ngTableParams) {
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
			if (params.filter()[column] != '') {
				var tokens = params.filter()[column].trim().split(' ');
				var paramfilter = "";
				var count = 0;
				for (var i = 0; i < tokens.length; i++) {
					if (i == 0) {
						paramfilter += column + ':*' + tokens[i] + '*';
					}
					else {
						paramfilter += ' AND ' + column + ':*' + tokens[i] + '*';
					}
				}
				filterparam.push(paramfilter);
			}
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
			$window.ga('send', 'event', {
					'eventCategory': 'TableSearch',
					'eventAction': data.responseHeader.params.fq
			});
			var docs = data.response.docs;
            console.log('search success!');
            params.total(data.response.numFound);
			
			for (var i = 0; i < docs.length; i++)  {
              if (docs[i].lat) {
				  docs[i].zoom = 14;
				  docs[i].maphtml = '<a target="_blank" href="http://maps.google.com/?ie=UTF8&q=' + docs[i].lat +','+docs[i].lng+'&ll='+docs[i].lat+','+docs[i].lng+'&z='+docs[i].zoom+'"><span class="glyphicon glyphicon-new-window"></span> Mapa</a>';
				  docs[i].agent = docs[i].agentResource == "http://www.coi.cz/" ? "ČOI" : undefined;
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
                    '<a ng-show="check.businessEntityID" target="_blank" href="http://linked.opendata.cz/resource/business-entity/CZ{{check.businessEntityID}}"><span class="glyphicon glyphicon-new-window"></span> {{check.businessEntityID}}</a>'+
			'</td>'+
            '<td data-title="\'Jméno subjektu\'" filter="{ \'businessEntityName\': \'text\' }" sortable="businessEntityName">'+
                    '{{check.businessEntityName}}'+
			'</td>'+
            '<td data-title="\'Sankce\'" sortable="sanctionValue">'+
                    '<a target="_blank" href="{{check.sanctionResource}}">{{check.sanctionValue}}{{check.sanctionValue ? " CZK" : ""}}</a>'+
			'</td>'+
            '<td data-title="\'Kontrolní orgán\'" >'+
                    '<a target="_blank" href="{{check.agentResource}}"><span class="glyphicon glyphicon-new-window"></span> {{check.agent ? check.agent : check.agentResource}}</a>'+
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
		controller: function($scope, $timeout, $resource, $http, $window, $location) {
		$scope.defaultZoom = 7;
		$scope.defaultCenter = {
			lat: 49.8037633,
			lng: 15.4749126
		};
		$scope.rows = 50;
		$scope.currentBounds = {
			northEast: {
				lat: 50.6726897,
				lng: 16.6549900
			},
			southWest: {
				lat: 48.7386294,
				lng: 12.368677899
			}
		};
		
		$scope.zoomChanged = function(zoom){
			//console.log('Zoom changed: ' + zoom);
			$scope.zoom = zoom;
//			if ($scope.dataPromise && $timeout.cancel($scope.dataPromise)) console.log("Cancelled");
			if ($scope.dataPromise) $timeout.cancel($scope.dataPromise);
			$scope.dataPromise = $timeout($scope.updateData, 500);
		};

		$scope.centerChanged = function(center){
			//console.log('Center changed: ' + center.lat + ' ' + center.lng);
			$scope.center = center;
//			if ($scope.dataPromise && $timeout.cancel($scope.dataPromise)) console.log("Cancelled");
			if ($scope.dataPromise) $timeout.cancel($scope.dataPromise);
			$scope.dataPromise = $timeout($scope.updateData, 500);
		};
		
		$scope.boundsChanged = function(bounds){
            if (bounds != undefined && bounds.northEast.lat != -1 )
			{
				//console.log('Bounds changed: ' + bounds.southWest.lat + ' ' + bounds.southWest.lng + ' ' + bounds.northEast.lat + ' ' + bounds.northEast.lng);
				$scope.currentBounds = bounds;
				//$scope.updateData();
			}
			else {
				//console.log('Bounds change failed');
			}
        };
		
		$scope.updateData = function() {
			if ($scope.currentBounds != undefined)
			{
				var filterparam = [];
				
				filterparam.push('lat:[' + $scope.currentBounds.southWest.lat + ' TO ' + $scope.currentBounds.northEast.lat + '] AND lng:[' + $scope.currentBounds.southWest.lng  + ' TO ' + $scope.currentBounds.northEast.lng + ']');
				var sparams = {'json.wrf': 'JSON_CALLBACK',
					  'q': '*:*',
					  'fq': filterparam,
					  'rows': $scope.rows,
					  };
					  
				$http(
				  {method: 'JSONP',
//				   url: 'http://localhost:8080/solr/collection1/query',
				   url: 'http://ruian.linked.opendata.cz/solr/collection1/query',
				   params: sparams
				  }
				).success(function(data) {
				var docs = data.response.docs;
				//console.log('search success!');

				$window.ga('send', 'event', {
						'eventCategory': 'MapSearch',
						'eventAction': data.responseHeader.params.fq
				});
				
				for (var i = 0; i < docs.length; i++)  {
				  
				  docs[i].coordinates = {
					lat: docs[i].lat,
					lng: docs[i].lng
				  };
				  docs[i].title = docs[i].businessEntityName;
				  docs[i].description = 
					'<dl class="mapwindow">' + 
					(docs[i].businessEntityID ? '<dt class="dt-inline">IČ</dt><dd class="bold dd-inline"><a target="_blank" href="http://linked.opendata.cz/resource/business-entity/CZ'+docs[i].businessEntityID+'"><span class="glyphicon glyphicon-new-window"></span> ' + docs[i].businessEntityID + '</a></dd><br/>' : "" ) +
					(docs[i].businessEntityName ? '<dt class="dt-none">Jméno subjektu<dt><dd class="bold">' + docs[i].businessEntityName + '</dd>' : "" ) +
					(docs[i].street ? '<dt class="dt-none">Adresa</dt><dd>' + docs[i].street + '<br/>' + docs[i].postalCode + ' ' + docs[i].locality + '<br/>' + docs[i].region + '</dd><br/>': '<dt class="dt-none">Adresa</dt><dd>' + docs[i].region + '</dd><br/>' ) +
					(docs[i].sanctionResource ? '<dt class="dt-inline">Sankce<dt><dd class="dd-inline"><a target="_blank" href="' + docs[i].sanctionResource + '"><span class="glyphicon glyphicon-new-window"></span> ' + docs[i].sanctionValue + ' CZK</a></dd><br/><br/>' : "" ) +
					(docs[i].agentResource ? '<dt class="dt-none">Kontrolní orgán</dt><dd class="dd-inline"><a target="_blank" href="' + docs[i].agentResource + '"><span class="glyphicon glyphicon-new-window"></span> ' + (docs[i].agentResource == "http://www.coi.cz/" ? "ČOI" : docs[i].agentResource) + '</a></dd><br/>' : "" ) +
					'<dt class="dt-none">Datum kontroly</dt><dd class="dd-inline"><a target="_blank" href="http://linked.opendata.cz/resource/domain/coi.cz/check-action/' + docs[i].checkActionID + '"><span class="glyphicon glyphicon-new-window"></span> ' + docs[i].checkDate.substring(0,10) + '</a></dd><br/>' +
					'</dl>'
				  ;
				  }
				$scope.currentNumber = docs.length;
				$scope.totalNumber = data.response.numFound;
				$scope.data = docs;
			  }
			).error(function() {
				console.log('Search failed!');
			  }
			);
			}
			else {
				//document.getElementById("zoom").addClass("hide");
			}
		};
		$scope.updateData();
	},
	template: '<div>'+
		'<div id="zoom" class="hide">Zazoomujte</div>' +
		'<div class="{{rows < totalNumber? \'alert alert-info\' : \'alert alert-success\'}}">Zobrazuji {{rows < totalNumber? rows : totalNumber}} kontrol z celkových {{totalNumber}} v aktuální mapové oblasti.{{rows < totalNumber ? \'Pokud chcete zobrazit všechny kontroly, zazoomujte tak, aby jich v oblasti bylo méně než \' + rows + \'.\' : \'\'}}</div>' +		
		'<gmaps class="bigmap" markers="data" center="defaultCenter" zoom="defaultZoom" zoom-changed="zoomChanged(zoom)" bounds-changed="boundsChanged(bounds)" center-changed="centerChanged(center)"></gmaps>' +
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
                center: '=',
                zoomChangedListener: '&zoomChanged',
                centerChangedListener: '&centerChanged',
                boundsChangedListener: '&boundsChanged',
                fitBounds: '='
            },
            controller: function ($scope) {

                $scope._gMarkers = [];
                $scope.markersMap = {};
				
				Array.prototype.diff = function(a) {
					return this.filter(function(i) {return a.indexOf(i) < 0;});
				};

                $scope.getTitle = function (item) {
                    var t = "";
                    if (item.title) {
                        t += item.title;
                    }
                    return t;
                };

                $scope.zoomChanged = function (zoomLevel) {
                    $scope.zoomChangedListener = $scope.zoomChangedListener || function () {
                    };
                    $scope.zoomChangedListener({zoom: zoomLevel});
                };

                $scope.centerChanged = function (center) {
                    $scope.centerChangedListener = $scope.centerChangedListener || function () {
                    };
                    $scope.centerChangedListener({center: {lat: center.lat(), lng: center.lng()}});
                };

                $scope.boundsChanged = function (bounds) {
                    $scope.boundsChangedListener = $scope.boundsChangedListener || function () {
                    };
                    var ne = bounds.getNorthEast();
                    var sw = bounds.getSouthWest();
                    $scope.boundsChangedListener({
                        bounds: {
                            northEast: {lat: ne.lat(), lng: ne.lng()},
                            southWest: {lat: sw.lat(), lng: sw.lng()}
                        }
                    });
                };

                $scope.updateMarkers = function () {

                    var newMarkersMap = {};
                    var newMarkers = [];
                    $scope.bounds = new google.maps.LatLngBounds();

                    angular.forEach($scope.markerData, function (item) {

                        var coords = item.coordinates;
                        var marker;

                        // REUSE OR CREATE
                        if ($scope.markersMap[coords.lat] && $scope.markersMap[coords.lat][coords.lng]) {
                            marker = $scope.markersMap[coords.lat][coords.lng];
                            marker.setMap($scope.map);
                        } else {
                            marker = new google.maps.Marker({
                                position: new google.maps.LatLng(coords.lat, coords.lng),
                                map: $scope.map,
                                title: $scope.getTitle(item)
                            });
                        }

                        // BOUNDS, REMEBERING MARKERS
                        newMarkersMap[coords.lat] = newMarkersMap[coords.lat] || {};
                        newMarkersMap[coords.lat][coords.lng] = marker;
                        newMarkers.push(marker);
                        $scope.bounds.extend(marker.position);

                        // INFO WINDOW
                        var contentString = '<p>' + item.description.replace(/\n/g, "<br />") + '</p>';

                        google.maps.event.addListener(marker, 'click', function (content) {
                            return function () {
                                $scope.infowindow.setContent(content);//set the content
                                $scope.infowindow.open($scope.map, this);
                            }
                        }(contentString));
                    });

                    var hideMarkers = $scope._gMarkers.diff(newMarkers);

                    angular.forEach(hideMarkers, function (m) {
                        m.setMap(null);
                    });

                    $scope._gMarkers = newMarkers;

                    $scope.markersMap = newMarkersMap;

                    if ($scope.fitBounds === true) {
                        $scope.map.fitBounds($scope.bounds);
                    }

                    $scope.boundsChanged($scope.bounds);
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

                google.maps.event.addListener($scope.map, 'zoom_changed', function () {
                    $scope.zoomChanged($scope.map.getZoom());
                });

                google.maps.event.addListener($scope.map, 'center_changed', function () {
                    $scope.centerChanged($scope.map.getCenter());
                });

                google.maps.event.addListener($scope.map, 'bounds_changed', function () {
                    $scope.boundsChanged($scope.map.getBounds());
                });

                $scope.infowindow = new google.maps.InfoWindow();
            },
            restrict: 'E',
            template: '<div class="gmaps"></div>',
            replace: true
        }
    }]);