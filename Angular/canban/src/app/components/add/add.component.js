(function() {
  'use strict';

  angular
    .module('canban')
    .component('addComponent', {
      templateUrl: 'app/components/add/add.template.html',
      bindings: {
        createTask: "&"
      },
      controller: function() {
        var _this = this;

        _this.show = false;
        _this.newTask = {};
        _this.showFieldInput = function() {
          _this.show = !_this.show;
        };

        _this.addTask = function(e, data) {
          if(!data.$valid) {
            return;
          } else {
            var temp = {
              task: data.task,
              priority: data.radio.value
            };
            _this.show = false;
            angular.element(e.target).closest('.add-task').find('.input-new-task').val('');
            _this.createTask({task:temp});
          }
        }
      }
    });
})();
