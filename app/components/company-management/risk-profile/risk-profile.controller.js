;(function () {
    'use strict';
    angular
        .module('app')
        .controller('RiskProfileController', RiskProfileController);

    RiskProfileController.$inject = ['data', '$mdDialog'];

    function RiskProfileController(data ,  $mdDialog) {
        let vm = this;

        vm.save = save;
        vm.cancel = cancel;

        console.log(data.risk);

        let id = data.risk.id;
        vm.id = id;

        if(id !== undefined){
            vm.data = {
                riskRange: data.risk.riskRange,
                description: data.risk.description,
                id: data.risk.id
            }
        }

        function cancel() {
            $mdDialog.cancel()
        }

        function save() {
            if (vm.riskForm.$invalid) {
                return;
            }
            else {
                if(id === undefined){
                    console.log(vm.data);
                    // companyService.companyCreate(vm.data).then(function (res) {
                    //     if (res.success) {
                    //         console.log(res.data);
                            let tmpObj = {
                                type: 'create',
                                data: vm.data
                            };
                            $mdDialog.hide(tmpObj);
                        // }
                        // else {
                        //     cancel();
                        // }
                    // });
                } else {
                    // companyService.companyEdit(id , vm.data).then(function (res) {
                    //     if (res.success) {
                            let tmpObj = {
                                type: 'edit',
                                data: vm.data
                            };
                            $mdDialog.hide(tmpObj);
                        // }
                        // else {
                        //     cancel();
                        // }
                    // });
                }

            }
        }
    }
})();