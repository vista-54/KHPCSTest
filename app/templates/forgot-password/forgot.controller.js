;(function () {
    'use strict';
    angular.module('app')
        .controller('ForgotController', ForgotController);

    ForgotController.$inject = ['userService', '$state' , 'toastr', 'tabsService'];

    function ForgotController(userService, $state , toastr, tabsService) {
        let vm = this;
        tabsService.startTab('page1');

        vm.forgot = forgot;

        function forgot() {
            if(vm.resetForm.$invalid){
                return;
            }
            else {
                userService.forgot(vm.data).then(function (res) {
                    if (res.success) {
                        toastr.success('Instructions was sent on your email');
                        $state.go('login');
                    }
                    else {
                        console.log('error');
                        toastr.error('Email is invalid' , 'Error');
                    }
                })
            }



        }
    }
})();