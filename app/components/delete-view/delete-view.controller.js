;(function () {
    'use strict';
    angular
        .module('app')
        .controller('DeleteViewController', DeleteViewController);

    DeleteViewController.$inject = ['$mdDialog'];

    function DeleteViewController($mdDialog) {
        let vm = this;

        vm.cancel = function() {
            $mdDialog.cancel();
        };

        vm.confirm = function() {
            $mdDialog.hide();
        };
    }
})();