(function() {
  'use strict';

  angular
    .module('canban')
    .service('mainService', mainService);

  /** @ngInject */
  function mainService($rootScope) {
    var _this = this;

    _this.tasks = $rootScope.tasks;
    _this.abortedTasks = $rootScope.abortedTasks;
    _this.inProgressTasks = $rootScope.inProgressTasks;
    _this.doneTasks = $rootScope.doneTasks;
    _this.maxID = $rootScope.maxID;

    //sorting of tasks
    var sortTasksPriority = function(tasks) {
      var hightPriority = [], normalPriority = [], lowPriority = [];
      for(var i=0; i<tasks.length; i++) {
        if(tasks[i].priority == 'hight') {
          hightPriority.push(tasks[i]);
        } else if(tasks[i].priority == 'normal') {
          normalPriority.push(tasks[i]);
        } else if(tasks[i].priority == 'low') {
          lowPriority.push(tasks[i]);
        }
      }
      return hightPriority.concat(normalPriority).concat(lowPriority);
    };

    var sortTasksTime = function(tasks) {
      tasks.sort(function(a, b) {
        return a.milliseconds - b.milliseconds;
      });
    };

    //addition a new task
    _this.addTask = function(obj) {
      var currentTime = new Date(),
        id;
      _this.maxID++;
      localStorage.setItem('maxID', _this.maxID);
      if(_this.tasks.length > 0) {
        id = _this.maxID;
      } else {
        id = 0;
      }

      var temp = {
        "year": currentTime.getFullYear()+'   ',
        "month": currentTime.getMonth()+'.',
        "date": currentTime.getDate()+'.',
        "hours": currentTime.getHours()+':',
        "minutes": currentTime.getMinutes()+':',
        "seconds": currentTime.getSeconds(),
        "milliseconds": currentTime.getTime(),
        "text": obj.task,
        "priority": obj.priority,
        "status": "new",
        "id":  id
      };
      _this.tasks.push(temp);
      sortTasksTime(_this.tasks);
      _this.tasks = sortTasksPriority(_this.tasks);
      return _this.tasks;
    };

    //editing of task
    _this.editTask = function(id, newText, priority) {
      var i=0;
      while(i<_this.tasks.length) {
        if(_this.tasks[i]['id'] == id) {
          _this.tasks[i]['text'] = newText;
          _this.tasks[i]['priority'] = priority;
          sortTasksTime(_this.tasks);
          _this.tasks = sortTasksPriority(_this.tasks);
          return _this.tasks;
        }
        i++;
      }
    };

    //saving tasks in localStorage
    _this.storage = function() {
      var doitTasks = angular.toJson(_this.tasks);
      localStorage.setItem('doitTasks', doitTasks);
    };

    _this.setStorageAbortedTasks = function() {
      var abortedTasks = angular.toJson(_this.abortedTasks);
      localStorage.setItem('abortedTasks', abortedTasks);
    };

    _this.setStorageInProgressTasks = function() {
      var inProgressTasks = angular.toJson(_this.inProgressTasks);
      localStorage.setItem('inProgressTasks', inProgressTasks);
    };

    _this.setStorageDoneTasks = function() {
      var doneTasks = angular.toJson(_this.doneTasks);
      localStorage.setItem('doneTasks', doneTasks);
    };

    //move tasks to aborted column
    _this.abortTask = function(obj) {
      var i=0;
      while(i<_this.tasks.length) {
        if(_this.tasks[i]['id'] == obj.id) {
          _this.abortedTasks.push(_this.tasks[i]);
          _this.tasks.splice(i, 1);
          sortTasksTime(_this.abortedTasks);
          _this.abortedTasks = sortTasksPriority(_this.abortedTasks);
          return _this.abortedTasks;
        }
        i++;
      }
    };

    //delete tasks from aborted column
    _this.removeTask = function(id) {
      var i=0;
      while(i<_this.abortedTasks.length) {
        if(_this.abortedTasks[i]['id'] == id) {
          _this.abortedTasks.splice(i, 1);
          return _this.abortedTasks;
        }
        i++;
      }
    };

    //move tasks to inProgress column
    _this.moveInProgress = function(id) {
      var i=0;
      while(i<_this.tasks.length) {
        if(_this.tasks[i]['id'] == id) {
          _this.tasks[i]['status'] = 'in-progress';
          _this.inProgressTasks.push(_this.tasks[i]);
          _this.tasks.splice(i, 1);
          sortTasksTime(_this.inProgressTasks);
          _this.inProgressTasks = sortTasksPriority(_this.inProgressTasks);
          return _this.inProgressTasks;
        }
        i++;
      }
    };

    //edition priority tasks
    _this.editInProgress = function(obj) {
      var i=0;
      while(i<_this.inProgressTasks.length) {
        if(_this.inProgressTasks[i]['id'] == obj.id) {
          _this.inProgressTasks[i]['priority'] = obj.priority;
          sortTasksTime(_this.inProgressTasks);
          _this.inProgressTasks = sortTasksPriority(_this.inProgressTasks);
          return _this.inProgressTasks;
        }
        i++;
      }
    };

    //move tasks to aborted column from inProgress column
    _this.abortInProgress = function(obj) {
      var i=0;
      while(i<_this.inProgressTasks.length) {
        if(_this.inProgressTasks[i]['id'] == obj.id) {
          _this.inProgressTasks[i]['status'] = 'aborted';
          _this.abortedTasks.push(_this.inProgressTasks[i]);
          _this.inProgressTasks.splice(i, 1);
          sortTasksTime(_this.abortedTasks);
          _this.abortedTasks = sortTasksPriority(_this.abortedTasks);
          return _this.abortedTasks;
        }
        i++;
      }
    };
    //move tasks from inProgress column to done column
    _this.moveToDone = function(obj) {
      var i=0;
      while(i<_this.inProgressTasks.length) {
        if(_this.inProgressTasks[i]['id'] == obj.id) {
          _this.inProgressTasks[i]['status'] = 'done';
          _this.doneTasks.push(_this.inProgressTasks[i]);
          _this.inProgressTasks.splice(i, 1);
          sortTasksTime(_this.doneTasks);
          _this.doneTasks = sortTasksPriority(_this.doneTasks);
          return _this.doneTasks;
        }
        i++;
      }
    };

    //delete tasks from done column
    _this.removeDoneTask = function(id) {
      var i=0;
      while(i<_this.doneTasks.length) {
        if(_this.doneTasks[i]['id'] == id) {
          _this.doneTasks.splice(i, 1);
          return _this.doneTasks;
        }
        i++;
      }
    }
  }
})();
