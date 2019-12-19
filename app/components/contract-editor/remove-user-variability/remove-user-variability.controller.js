;(function () {
    'use strict';
    angular.module('app')
        .controller('RemoveUserVarController', RemoveUserVarController);

    RemoveUserVarController.$inject = ['data', 'toastr', '$mdDialog', 'contractService'];

    function RemoveUserVarController(data, toastr, $mdDialog, contractService) {
        let vm = this;

        let sendStatus = false;
        let tmpObj = {success: false};

        vm.confirm = function () {
            if (sendStatus === false) {
                sendStatus = true;
                contractService.removeVariability(data.id).then(function (res) {
                    console.log(res);
                    if (res.success) {
                        contractService.getVariabilityWithDeleted().then(function (res) {
                            // console.log(res.data, 'Variability list');
                            toastr.success('Remove success');

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
                        console.log('Remove user variability error');
                        toastr.error('Remove user variability error');
                        sendStatus = false;
                    }
                });
            }
        };

        vm.cancel = function () {
            $mdDialog.hide(tmpObj);
        };

    }
})();