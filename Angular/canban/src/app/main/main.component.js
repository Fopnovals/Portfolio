(function() {
  'use strict';

  angular
    .module('canban')
    .component('mainComponent', {
      templateUrl: 'app/main/main.template.html',
      controller: function(mainService) {

        this.tasks = mainService.tasks;
        this.abortedTasks = mainService.abortedTasks;
        this.inProgressTasks = mainService.inProgressTasks;
        this.doneTasks = mainService.doneTasks;

        this.createTask = function(val) {
          this.tasks = mainService.addTask(val);
          mainService.storage();
        };

        this.editTask = function(obj) {
          this.tasks = mainService.editTask(obj.id, obj.text, obj.priority);
          mainService.storage();
        };

        this.abortedTask = function(obj) {
          this.abortedTasks = mainService.abortTask(obj);
          mainService.setStorageAbortedTasks();
          mainService.storage();
        };

        this.removeTask = function(obj) {
          this.abortedTasks = mainService.removeTask(obj.id);
          mainService.setStorageAbortedTasks();
        };

        this.moveInProgress = function(obj) {
          this.inProgressTasks = mainService.moveInProgress(obj.id);
          mainService.storage();
          mainService.setStorageInProgressTasks();
        };

        this.editInProgress = function(obj) {
          this.inProgressTasks = mainService.editInProgress(obj);
          mainService.setStorageInProgressTasks();
        };

        this.abortInProgressTask = function(obj) {
          this.abortedTasks = mainService.abortInProgress(obj);
          mainService.setStorageInProgressTasks();
          mainService.setStorageAbortedTasks();
        };

        this.moveToDone = function(obj) {
          this.doneTasks = mainService.moveToDone(obj);
          mainService.setStorageInProgressTasks();
          mainService.setStorageDoneTasks();
        };

        this.removeDoneTask = function(obj) {
          this.doneTasks = mainService.removeDoneTask(obj.id);
          mainService.setStorageDoneTasks();
        }
      }
    });

})();
