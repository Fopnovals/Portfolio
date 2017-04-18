(function() {
  'use strict';

  angular
    .module('canban')
    .component('doneComponent', {
      templateUrl: 'app/components/done/done.template.html',
      bindings: {
        remove: "&",
        doneTasks: "<",
        removeDoneTask: '&'
      },
      controller: function() {
        this.removeTask = function(removeId) {
          this.removeDoneTask({obj: {'id': removeId}});
        };

      }
    });
})();
