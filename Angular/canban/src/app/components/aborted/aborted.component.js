(function() {
  'use strict';

  angular
    .module('canban')
    .component('abortedComponent', {
      templateUrl: 'app/components/aborted/aborted.template.html',
      bindings: {
        remove: "&",
        abortedTasks: "<"
      },
      controller: function() {
        this.removeTask = function(removeId) {
          this.remove({obj: {'id': removeId}});
        };
      }
    });
})();
