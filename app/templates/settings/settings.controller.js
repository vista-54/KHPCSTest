;(function () {
    'use strict';

    angular.module('app')
        .controller('SettingsController', SettingsController);

    SettingsController.$inject = ['tabsService'];

    function SettingsController(tabsService) {
        let vm = this;
        tabsService.startTab('page5');

    }
})();