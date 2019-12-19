;(function () {
    'use strict';
    angular
        .module('app')
        .controller('DialogViewController', DialogViewController);

    DialogViewController.$inject = ['$mdDialog', 'dataFromDialog', 'userService'];

    function DialogViewController($mdDialog, dataFromDialog, userService) {
        let vm = this;
        if (dataFromDialog.customer) {
            fromUserManagement();
        } else {
            fromPassingQustion();
        }

        function fromUserManagement() {
            let customer = dataFromDialog.customer;
            let reports = dataFromDialog.reports;
            let surveys = dataFromDialog.surveys;
            let templates = dataFromDialog.templates;
            let actualSurveyId;
            let actualSurveyName;
            let actualReportId;
            let actualTemplateId;
            let actualTemplateName;

            vm.surveys = [];
            vm.templates = [];
            vm.showTemplates = false;
            vm.showSurveys = true;
            vm.showOK = false;
            vm.showLink = false;

            reports.forEach(function (item) {
                for (let i = 0; i < surveys.length; i++) {
                    if (item.survey_id === surveys[i].survey_id && surveys.survey_status !== 0) {
                        let tmpSurvey = {
                            report_id: item.id,
                            survey_id: item.survey_id,
                            name: surveys[i].survey_name
                        };
                        vm.surveys.push(tmpSurvey);
                        // console.log(vm.surveys);
                    }
                }
            });

            vm.actualSurvey = function (survey) {
                vm.templates = [];
                actualSurveyId = survey.survey_id;
                actualSurveyName = survey.name;
                actualReportId = survey.report_id;

                for (let i = 0; i < templates.length; i++) {
                    if (actualSurveyId === templates[i].survey_id) {
                        let tmpTemplate = {
                            id: templates[i].id,
                            name: templates[i].title
                        };
                        vm.templates.push(tmpTemplate);
                    }
                }
                vm.showTemplates = true;
                vm.showOK = false;

                if (!vm.templates.length) {
                    vm.emptyTemplate = true;
                } else {
                    vm.emptyTemplate = false;
                }
            };


            vm.actualTemplate = function (template) {
                actualTemplateId = template.id;
                actualTemplateName = template.name;
                // console.log('actualTemplateId = ' + actualTemplateId);
                vm.showOK = true;
            };

            vm.cancel = function () {
                $mdDialog.cancel();
            };


            vm.finish = function () {
                let filename = customer + ' ' + actualSurveyName + ' ' + actualTemplateName;
                // let filename = customer + ' ' + actualSurveyName + ' ' + actualTemplateName + new Date().getTime();
                filename = filename.split('/').join(' ');
                userService.getContract(actualReportId, actualTemplateId, filename).then(function (links) {
                    let link = links.filePathUrlPdf;
                    if ((navigator.userAgent.search(/Chrome/) > -1) || (navigator.userAgent.search(/Safari/) > -1)) {
                        //Creating new link node.
                        let downloadPDF = document.createElement('a');
                        downloadPDF.href = link;

                        if (downloadPDF.download !== undefined) {
                            //Set HTML5 download attribute. This will prevent file from opening if supported.
                            downloadPDF.download = filename;
                        }

                        //Dispatching click event.
                        if (document.createEvent) {
                            let e = document.createEvent('MouseEvents');
                            e.initEvent('click', true, true);
                            downloadPDF.dispatchEvent(e);
                            return true;
                        }
                    }
                    else {
                        let query = '?download';

                        window.open(link + query, '_self');
                    }
                });

                $mdDialog.cancel();
            };

        }

        function fromPassingQustion() {
            let templates = dataFromDialog.templates;
            let actualSurveyName = dataFromDialog.all.survey_name;
            let actualSurveyId = dataFromDialog.all.survey_id;
            let actualReportId = dataFromDialog.all.report_id;
            let customer = dataFromDialog.all.customer_name + '_' + dataFromDialog.all.customer_surname;

            let actualTemplateId;
            let actualTemplateName;
            vm.templates = [];
            vm.showTemplates = true;
            vm.emptyTemplate = false;

            for (let i = 0; i < templates.length; i++) {
                if (actualSurveyId === templates[i].survey_id) {
                    let tmpTemplate = {
                        id: templates[i].id,
                        name: templates[i].title
                    };
                    vm.templates.push(tmpTemplate);
                }
            }

            if (!vm.templates.length) {
                vm.emptyTemplate = true;
            } else {
                vm.emptyTemplate = false;
            }

            vm.actualTemplate = function (template) {
                actualTemplateId = template.id;
                actualTemplateName = template.name;
                vm.showOK = true;
            };

            vm.cancel = function () {
                $mdDialog.cancel();
            };

            vm.finish = function () {
                let filename = customer + ' ' + actualSurveyName + ' ' + actualTemplateName;
                // let filename = customer + ' ' + actualSurveyName + ' ' + actualTemplateName + new Date().getTime();
                filename = filename.split('/').join(' ');
                userService.getContract(actualReportId, actualTemplateId, filename).then(function (links) {
                    let link = links.filePathUrlPdf;
                    if ((navigator.userAgent.search(/Chrome/) > -1) || (navigator.userAgent.search(/Safari/) > -1)) {
                        //Creating new link node.
                        let downloadPDF = document.createElement('a');
                        downloadPDF.href = link;

                        if (downloadPDF.download !== undefined) {
                            //Set HTML5 download attribute. This will prevent file from opening if supported.
                            downloadPDF.download = filename;
                        }

                        //Dispatching click event.
                        if (document.createEvent) {
                            let e = document.createEvent('MouseEvents');
                            e.initEvent('click', true, true);
                            downloadPDF.dispatchEvent(e);
                            return true;
                        }
                    }
                    else {
                        let query = '?download';

                        window.open(link + query, '_self');
                    }
                    //////////////////////////

                    // let downloadPDF = document.createElement('a');
                    // downloadPDF.setAttribute('href', link);
                    // downloadPDF.setAttribute('download', filename);
                    // downloadPDF.click();

                    // userService.removePdf(link.filenamePdf).then(function (res) {
                    //     console.log(res);
                    // });
                });

                $mdDialog.cancel();
            };

        }
    }
})();