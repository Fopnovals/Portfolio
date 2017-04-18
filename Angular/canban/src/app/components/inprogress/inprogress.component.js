(function() {
  'use strict';

  angular
    .module('canban')
    .component('inProgressComponent', {
      templateUrl: 'app/components/inprogress/inprogress.template.html',
      bindings: {
        inProgress: '<',
        editInProgressTask: '&',
        abortedTask: '&',
        moveToDone: '&'
      },
      controller: function() {

        this.edit = function(e) {
          e.preventDefault();
          var elem = angular.element(e.target);
          elem.hide();
          elem.next().show();
          elem.parent().next().show();
        };

        this.save = function(e, obj) {
          var elem = angular.element(e.target);
          elem.hide();
          elem.prev().show();
          elem.parent().next().hide();
          this.editInProgressTask({obj: obj});
        };

        this.aborted = function(id) {
          var obj = {
            'status': 'aborted',
            'id': id
          };
          this.abortedTask({'obj': obj});
        };

        this.done = function(id) {
          var obj = {
            'status': 'done',
            'id': id
          };
          this.moveToDone({'obj': obj});
        }
      }

    });

})();
