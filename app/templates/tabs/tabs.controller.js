;(function () {
    'use strict';
    angular.module('app')
        .controller('TabsController', TabsController);

    TabsController.$inject = ['userService', 'tabs', 'tabsService', '$state', '$mdSidenav', '$scope'];

    function TabsController(userService, tabs, tabsService, $state, $mdSidenav, $scope) {
        let vm = this;



        vm.user = userService.getUser();


        vm.currentNavItem =  'page1';

        $scope.$on('changeTab',function (event, tab) {
            vm.currentNavItem = tab;
        });

        vm.profile = function () {
            console.log('Test profile');
        };

        vm.logout = function () {
            tabsService.logout().then(function (res) {
                if (res.success === true) {
                    $state.go('login');
                    tabs.clearAfterLogout();
                } else {
                    console.log('Logout error');
                }
            });
        };

        vm.closeNavButton = closeNav;
        function closeNav(page) {
            $mdSidenav('nav').close();
        }

        vm.toggleOpenNav = buildToggler('nav');
        function buildToggler(nav) {
            return function () {
                $mdSidenav(nav).toggle();
            };
        }
    }

})();