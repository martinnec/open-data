'use strict';

/* Controllers */


angular.module('InspectionsViewerApp.controllers', [])
  .controller('TableController', [
    '$scope',
	'$window',
	'$location',
    function($scope, $window, $location) {
      
	$window.ga('send', 'pageview', { page: $location.path() });    

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
	'$window',
	'$location',
    function($scope, $window, $location) {
      
	$window.ga('send', 'pageview', { page: $location.path() });    

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
	'$window',
	'$location',
    function($scope, $window, $location) {
      
	$window.ga('send', 'pageview', { page: $location.path() });    

	//search query entered by the user    
      $scope.query = '';
      
      //results of the search query executed on the SOLR instance
      $scope.results = [];
	  
      $scope.zoom = 0;
		$scope.center = {
			lat: 49.8037633,
			lng: 15.4749126
		};
	  
	  $scope.zoomChanged = function(zoom){
		console.log(zoom);
      };

      $scope.centerChanged = function(center){
		console.log(center);
      };

	  document.getElementById("nav-tabulka").removeAttribute("class");
	  document.getElementById("nav-mapa").setAttribute("class","active");
	  document.getElementById("nav-sources").removeAttribute("class");
	  
    }
  ])  ;