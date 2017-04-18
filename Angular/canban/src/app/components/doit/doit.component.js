(function() {
  'use strict';

  angular
    .module('canban')
    .component('doitComponent', {
      templateUrl: 'app/components/doit/doit.template.html',
      bindings: {
        tasks: "<",
        editTask: "&",
        abortedTask: "&",
        moveInProgress: "&",
        dynamicFilter: '@'
      },
      controller: function() {

        this.edit = function(e) {
          e.preventDefault();
          var elem = angular.element(e.target);
          elem.closest('.task').find('.task-description').attr({'disabled': false}).focus();
          elem.hide();
          elem.next().show();
          elem.parent('.buttons').next('.edit-priority').show();
        };

        this.save = function(e, obj) {
          var elem = angular.element(e.target);
          elem.closest('.task').find('.task-description').attr({'disabled': true});
          elem.hide();
          elem.prev().show();
          elem.parent('.buttons').next('.edit-priority').hide();
          this.editTask({obj: obj});
        };

        this.aborted = function(id) {
          var obj = {
            'status': 'aborted',
            'id': id
          };
          this.abortedTask({'obj': obj});
        };

        this.inProgress = function(id) {
          this.moveInProgress({obj: {'id': id}});
        };
      }
    });

})();
