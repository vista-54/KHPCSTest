;(function () {
    'use strict';
    angular.module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['userService', '$localStorage', '$state' , 'toastr', 'tabsService'];

    function LoginController(userService, $localStorage, $state , toastr, tabsService) {
        let vm = this;
        tabsService.startTab('page1');

        vm.login = login;

        function login() {
            userService.setToken(undefined);
            if(vm.loginForm.$invalid){
                return;
            }
            else{
                userService.login(vm.data).then(function (res) {
                    if (res.success){
                        userService.setToken(res.data.token);
                        userService.loadUser().then(function () {
                            userService.loadItems().then(function () {
                                let userRole = userService.getUser().role_id;
                                if (userRole === 3) {
                                    return $state.go('tab.company');
                                } else {
                                    $state.go('tab.user-management');
                                }
                            })
                        })
                    }
                    else {
                        toastr.error('Please try again', 'Login or password is invalid');
                    }
                })
            }

        }
    }
})();