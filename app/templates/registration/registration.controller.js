;(function () {
    'use strict';
    angular.module('app')
        .controller('RegistrationController', RegistrationController);

    RegistrationController.$inject = ['userService', '$state', 'toastr',  '$stateParams', 'tabsService'];

    function RegistrationController(userService, $state, toastr,  $stateParams, tabsService) {
        let vm = this;
        tabsService.startTab('page1');

        vm.register = register;

        vm.user = userService.getUser();

        let token = $stateParams.token;

        function register() {
            if (vm.regForm.$invalid || vm.data.password !== vm.data.password_confirmation) {
                console.log('err');
            }
            else {
                userService.setToken(undefined);
                userService.registration(token , vm.data).then(function (res) {
                    if (res.success) {
                        $state.go('login');
                        toastr.success('Registration successful');
                    } else {

                    }
                });
            }
        }
    }
})();