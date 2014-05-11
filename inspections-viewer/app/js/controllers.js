'use strict';

/* Controllers */


angular.module('InspectionsViewerApp.controllers', [])
  .controller('TableController', [
    '$scope',
    function($scope) {
      
      //search query entered by the user    
      $scope.query = '';
      
      //results of the search query executed on the SOLR instance
      $scope.results = [];
	  
	  document.getElementById("nav-tabulka").setAttribute("class","active");
	  document.getElementById("nav-mapa").removeAttribute("class");
	  document.getElementById("nav-sources").removeAttribute("class");
      
    }
  ])
  .controller('SourcesController', [
    '$scope',
    function($scope) {
      
      //search query entered by the user    
      $scope.query = '';
      
      //results of the search query executed on the SOLR instance
      $scope.results = [];
	  
	  document.getElementById("nav-tabulka").removeAttribute("class");
	  document.getElementById("nav-mapa").removeAttribute("class");
	  document.getElementById("nav-sources").setAttribute("class","active");
      
    }
  ])
  .controller('MapController', [
    '$scope',
    function($scope) {
      
      //search query entered by the user    
      $scope.query = '';
      
      //results of the search query executed on the SOLR instance
      $scope.results = [];
      
	  
      $scope.zoom = 0;
      $scope.center = {lat: 49, lng: 15};

	  document.getElementById("nav-tabulka").removeAttribute("class");
	  document.getElementById("nav-mapa").setAttribute("class","active");
	  document.getElementById("nav-sources").removeAttribute("class");
	  
    }
  ])
  /*.controller('BusinessEntityDetailController', [
    '$scope', '$routeParams', '$http',
    function($scope, $routeParams, $http)  {
      
      //search query entered by the user    
      $scope.query = '';
      
      //results of the search query executed on the SOLR instance
      $scope.results = [];
      
      // business entity to view
      $scope.businessEntityID = $routeParams.businessEntityID;
      
      // check actions found for the entity
      $scope.checkActions = [];
      
      console.log('Searching for ' + $scope.businessEntityID);
      $http(
          {method: 'JSONP',
           url: 'http://ruian.linked.opendata.cz:8080/solr/collection1/query',
           params:{'json.wrf': 'JSON_CALLBACK',
                  'q': 'businessEntityID:' + $scope.businessEntityID,
                  'rows': '500000'}
          }
        ).success(function(data) {
            var docs = data.response.docs;
            console.log('search success!');
            $scope.checkActions.docs = docs;
            for (var i = 0; i < $scope.checkActions.docs.length; i++)  {
              $scope.checkActions.docs[i].center = {
                latitude: $scope.checkActions.docs[i].lat,
                longitude: $scope.checkActions.docs[i].lng
              };
              $scope.checkActions.docs[i].zoom = 14;
            }
            $scope.checkActions.numFound = data.response.numFound;            
          }
        ).error(function() {
            console.log('Search failed!');
          }
        );
    }
  ])*/
  ;