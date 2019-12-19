;(function () {
    'use strict';

    angular
        .module('service.tabsService', [])
        .service('tabsService', tabsService);

    tabsService.$inject = ['http', 'url', '$localStorage' , '$sessionStorage', '$mdDialog'];

    function tabsService(http, url, $localStorage, $sessionStorage, $mdDialog) {
        let model = {};

        model.logout = logout;
        model.startTab = startTab;

        return model;

        function logout() {
            return http.get(url.logout_func($localStorage.token).logout);
        }

        function startTab(activeTab) {
            $mdDialog.cancel();
        }
    }
})();