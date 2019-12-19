;(function () {
    'use strict';
    angular.module('app')
        .controller('AddBlockController', AddBlockController);

    AddBlockController.$inject = ['userService', 'blockService', 'survey', '$mdDialog', 'data' , 'toastr'];

    function AddBlockController(userService, blockService, survey, $mdDialog, data , toastr) {
        let vm = this;

        let item = data.item;
        let idSurvey = data.idSurvey;
        let order_number = data.order_number;


        vm.cancel = cancel;
        vm.saveBlock = saveBlock;

        function cancel() {
            $mdDialog.cancel()
        }


        if (typeof item != 'undefined') {
            vm.data = {
                name: item.name
            };
            vm.type = false
        }
        else {
            vm.type = true
        }

        function saveBlock() {

            if (vm.blockForm.$invalid) {
                toastr.error('Please try again', 'Form is invalid');
            }
            else {
                if (typeof item != 'undefined') {
                    blockService.updateBlock(item.id, vm.data).then(function (res) {
                        if (res.success) {
                            let tmpObj = {
                                type: true,
                                data: res.data
                            };
                            $mdDialog.hide(tmpObj);
                        }
                        else {
                            cancel();
                        }
                    });
                }
                else {
                    vm.data.order_number = order_number;

                    blockService.createBlock(idSurvey, vm.data).then(function (res) {
                        if (res.success) {
                            let tmpObj = {
                                type: false,
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