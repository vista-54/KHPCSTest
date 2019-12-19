;(function () {
    'use strict';
    angular.module('app')
        .controller('RemoveTemplateController', RemoveTemplateController);

    RemoveTemplateController.$inject = ['data', 'toastr', '$mdDialog', 'contractService'];

    function RemoveTemplateController(data, toastr, $mdDialog, contractService) {
        let vm = this;

        let sendStatus = false;
        let tmpObj = {success: false};

        vm.confirm = function () {
            if (sendStatus === false) {
                sendStatus = true;

                contractService.removeTemplate(data.templateID).then(function (res) {
                    console.log(res);
                    if (res.success) {
                        contractService.loadTemplatesForThePoll(data.activeSurveyID).then(function (res) {
                            if (res.success) {
                                tmpObj.templates = res.data;
                                sendStatus = false;
                                tmpObj.success = true;
                                $mdDialog.hide(tmpObj);
                            } else {
                                console.log('load templates error');
                            }
                        });
                    } else {
                        console.log('Failed to delete contract');
                        toastr.invalid('Failed to delete contract');
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