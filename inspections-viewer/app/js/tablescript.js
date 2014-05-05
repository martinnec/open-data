var app = angular.module('main', ['ngTable', 'ngResource'])
.controller('DemoCtrl', function($scope, $timeout, $resource, $http, ngTableParams) {
    
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,          // count per page
        sorting: {
            checkActionID: 'asc'     // initial sorting
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
				filterparam.push(column + ':*' + (params.filter()[column]) + '*');
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
			$defer.resolve(data.response.docs);
          }
        ).error(function() {
            console.log('Search failed!');
          }
        );
        }
    });
});