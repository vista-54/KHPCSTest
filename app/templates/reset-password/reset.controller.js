;(function () {
    'use strict';
    angular.module('app')
        .controller('ResetController', ResetController);

    ResetController.$inject = ['userService', '$state' , 'toastr' , '$stateParams', 'tabsService'];

    function ResetController(userService, $state , toastr , $stateParams, tabsService) {
        let vm = this;
        tabsService.startTab('page1');

        vm.reset = reset;

        let token = $stateParams.token;

        function reset() {

            if (vm.resetForm.$invalid || vm.data.password !== vm.data.password_confirmation) {
                return;
            } else {
                userService.reset(token, vm.data).then(function (res) {
                    if (res.success) {
                        toastr.success('Password was changed');
                        $state.go('login');
                    }
                    else {
                        console.log('error');
                        toastr.error('This link is inactive' , 'Error');
                    }
                })
            }


        }
    }
})();