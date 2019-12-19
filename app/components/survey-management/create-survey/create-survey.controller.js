;(function () {
    'use strict';

    angular.module('app')
        .controller('CreateSurveyController', CreateSurveyController);

    CreateSurveyController.$inject = ['surveyService', '$mdDialog', 'data'];

    function CreateSurveyController(surveyService,  $mdDialog, data) {

        let vm = this;
        let id = data.id;

        vm.id = id;

        vm.cancel = cancel;

        function cancel() {
            $mdDialog.cancel()
        }

        vm.data = {
            status: '2'
        };

        if (typeof id != 'undefined') {
            vm.data = {
                name: data.survey.survey_name
            };
        }

        vm.saveSurvey = saveSurvey;
        function saveSurvey() {
            if (!vm.surveyForm.$invalid) {
                if (typeof id != 'undefined') {
                    surveyService.updateSurvey(id, vm.data).then(function (res) {
                        if (res.success) {
                            let tmpObj = {
                                type: 'update',
                                data: res.data
                            };
                            $mdDialog.hide(tmpObj);
                        } else {
                            console.log('errorUpd');
                        }
                    });
                }
                else {
                    surveyService.createSurvey(vm.data).then(function (res) {
                        if (res.success) {
                            let tmpObj = {
                                type: 'create',
                                data: res.data
                            };
                            $mdDialog.hide(tmpObj);
                        } else {
                            console.log('errorCreate');
                        }
                    });
                }
            }
        }
    }
})();
