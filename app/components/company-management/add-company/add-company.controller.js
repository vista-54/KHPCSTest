;(function () {
    'use strict';
    angular
        .module('app')
        .controller('AddCompanyController', AddCompanyController);

    AddCompanyController.$inject = ['data','companyService' , '$mdDialog', '$state'];

    function AddCompanyController(data ,companyService ,  $mdDialog, $state) {
        let vm = this;

        vm.save = save;
        vm.cancel = cancel;

        let id = data.id;
        vm.id = id;

        if(id !== undefined){
            vm.data = {
                name: data.company.name,
                id: id
            }
        }

        function cancel() {
            $mdDialog.cancel()
        }

        function save() {
            if (vm.companyForm.$invalid) {
                return;
            }
            else {
                if(id === undefined){
                    console.log(vm.data);
                    companyService.companyCreate(vm.data).then(function (res) {
                        if (res.success) {
                            console.log(res.data);
                            let tmpObj = {
                                type: 'create',
                                data: res.data
                            };
                            $mdDialog.hide(tmpObj);
                        }
                        else {
                            cancel();
                        }
                    });
                } else {
                    companyService.companyEdit(id , vm.data).then(function (res) {
                        if (res.success) {
                            let tmpObj = {
                                type: 'edit',
                                data: res.data
                            };
                            $mdDialog.hide(tmpObj);
                        }
                        else {
                            cancel();
                        }
                    });
                }

            }
        }
    }
})();