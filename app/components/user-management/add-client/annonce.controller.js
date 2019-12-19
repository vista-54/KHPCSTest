;(function () {
    'use strict';
    angular
        .module('app')
        .controller('AnnonceController', AnnonceController);

    AnnonceController.$inject = ['$mdDialog'];

    function AnnonceController($mdDialog) {
        let vm = this;

        vm.confirm = function() {
            $mdDialog.hide();
        };
    }
})();