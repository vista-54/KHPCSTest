;(function () {
    'use strict';
    angular
        .module('app')
        .controller('AddAdminController', AddAdminController);

    AddAdminController.$inject = ['data', '$mdDialog', '$state','toastr' , 'companyService'];

    function AddAdminController(data, $mdDialog, $state,toastr, companyService) {
        let vm = this;

        vm.save = save;
        vm.cancel = cancel;

        function cancel() {
            $mdDialog.cancel()
        }

        vm.userRole = data.role;

        vm.data = {
            email: '',
            role_id: '',
            company_id: data.id,
            is_used: 0
        };

        function save() {

            vm.data.role_id = vm.data.role;
            if (vm.adminForm.$invalid) {
                return;
            }
            else {
                companyService.inviteAdm(vm.data).then(function (res) {
                    if (res.success) {
                        console.log(res.data);
                            let tmpObj = {
                                type: 'createCompanyAdm',
                                data: res.data.data
                            };
                            $mdDialog.hide(tmpObj);
                    }
                    else {
                        toastr.error('This email is already taken');
                    }

                });
            }
        }
    }
})();