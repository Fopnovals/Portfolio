(function() {
  'use strict';

  angular
    .module('canban')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope) {
    $rootScope.maxID = angular.fromJson(localStorage.getItem('maxID')) || -1;
    $rootScope.tasks = angular.fromJson(localStorage.getItem('doitTasks')) || [];
    $rootScope.inProgressTasks = angular.fromJson(localStorage.getItem('inProgressTasks')) || [];
    $rootScope.doneTasks = angular.fromJson(localStorage.getItem('doneTasks')) || [];
    $rootScope.abortedTasks = angular.fromJson(localStorage.getItem('abortedTasks')) || [];
    $rootScope.inProgressTasks = angular.fromJson(localStorage.getItem('inProgressTasks')) || [];
  }

})();
