;(function () {
    'use strict';
    angular.module('app')
        .controller('AddUpdateUserVarController', AddUpdateUserVarController);

    AddUpdateUserVarController.$inject = ['data', 'toastr', '$mdDialog', 'contractService'];

    function AddUpdateUserVarController(data, toastr, $mdDialog, contractService) {
        let vm = this;

        // console.log(data);

        if (data.type === 'create') {
            vm.showCreateButton = true;
            vm.showUpdateButton = false;
        } else {
            vm.showCreateButton = false;
            vm.showUpdateButton = true;
            vm.data = data;
        }

        let sendStatus = false;
        let tmpObj = {success: false};


        vm.createVariability = function () {
            if (vm.varForm.name.$invalid) {
                toastr.error('Error invalid data');
            } else {
                if (sendStatus === false) {
                    sendStatus = true;
                    contractService.createVariability(vm.data).then(function (res) {
                        console.log(res);
                        if (res.success) {
                            contractService.getVariabilityWithDeleted().then(function (res) {
                                console.log(res.data, 'Variability list');

                                let notDeletedVariability = [];
                                let deletedVariability = [];
                                res.data.forEach(function (cell) {
                                    if (cell.deleted_at === null) {
                                        notDeletedVariability.push(cell);
                                    } else {
                                        deletedVariability.push(cell);
                                    }
                                });

                                tmpObj.notDeletedVariability = notDeletedVariability;
                                tmpObj.deletedVariability = deletedVariability;
                                tmpObj.success = true;
                                $mdDialog.hide(tmpObj);
                            });
                        } else {
                            console.log('Create user variability error');
                            toastr.error('Create user variability error');
                            sendStatus = true;
                        }
                    });
                }
            }
        };

        vm.updateVariability = function () {
            if (vm.varForm.name.$invalid) {
                toastr.error('Error invalid data');
            }
            else {
                if (sendStatus === false) {
                    sendStatus = true;
                    let body = {text: vm.data.text};
                    let id = vm.data.id;

                    contractService.editVariability(id, body).then(function (res) {
                        console.log(res);
                        if (res.success) {
                            contractService.getVariabilityWithDeleted().then(function (res) {
                                console.log(res.data, 'Variability list');

                                let notDeletedVariability = [];
                                let deletedVariability = [];
                                res.data.forEach(function (cell) {
                                    if (cell.deleted_at === null) {
                                        notDeletedVariability.push(cell);
                                    } else {
                                        deletedVariability.push(cell);
                                    }
                                });

                                tmpObj.notDeletedVariability = notDeletedVariability;
                                tmpObj.deletedVariability = deletedVariability;
                                tmpObj.success = true;
                                $mdDialog.hide(tmpObj);
                            });
                        } else {
                            console.log('Update user variability error');
                            toastr.error('Update user variability error');
                            sendStatus = true;
                        }
                    });
                }
            }
        };

        vm.close = function () {
            $mdDialog.hide(tmpObj);
        };

    }
})();