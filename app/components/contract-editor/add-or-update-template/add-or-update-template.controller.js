;(function () {
    'use strict';
    angular.module('app')
        .controller('AddUpdateTemplateController', AddUpdateTemplateController);

    AddUpdateTemplateController.$inject = ['data', 'toastr', '$mdDialog', 'contractService'];

    function AddUpdateTemplateController(data, toastr, $mdDialog, contractService) {
        let vm = this;

        let sendStatus = false;
        let tmpObj = {success: false};
        console.log(data);

        vm.type = data.type;

        let templates = data.templates;
        let tmpResearchId = data.tmpResearchId;
        let activeSurveyID = data.activeSurveyID;
        let activeTemplateTitle = data.activeTemplateTitle;
        let activeTemplateId = data.activeTemplateId;
        let tmpAnswersArr = data.tmpAnswersArr;
        let pasteImgBeforeCreateTemplate = data.pasteImgBeforeCreateTemplate;

        if (vm.type === 'create') {
            vm.showCreateButton = true;
            vm.showSaveButton = false;
            vm.showSaveAsButton = false;
        } else if (vm.type === 'save') {
            vm.showCreateButton = false;
            vm.showSaveButton = true;
            vm.showSaveAsButton = false;
            vm.data = {
                title: activeTemplateTitle,
                body: "",
                survey_id: activeSurveyID
            };

        } else if (vm.type === 'saveAs') {
            vm.showCreateButton = false;
            vm.showSaveButton = false;
            vm.showSaveAsButton = true;
            vm.data = {
                title: activeTemplateTitle,
                body: "",
                survey_id: activeSurveyID
            };

        }


        vm.createTemplate = function () {
            if (sendStatus === false) {
                sendStatus = true;
                vm.data = {
                    title: vm.data.title,
                    body: "<!doctype html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\"content=\"width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0\"><meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\"><title>Document</title></head><body></body></html>",
                    survey_id: activeSurveyID
                };

                let nameValidation = true;
                if (templates.length) {
                    for (let index in templates) {
                        if (templates[index].title === vm.data.title) {
                            nameValidation = false;
                            console.log('validation false');
                            break;
                        }
                    }
                }

                if (vm.templateForm.name.$invalid) {
                    toastr.error('Error invalid data');
                    sendStatus = false;
                } else if (nameValidation === false) {
                    toastr.error('Name already in use');
                    sendStatus = false;
                } else {
                    contractService.createNewResearch().then(function (res) {
                        tmpResearchId = res.data.id;
                        console.log('Create research (' + tmpResearchId + ')');

                        createTemplate();
                    });
                }
            }

            function createTemplate() {
                contractService.createTemplate(tmpResearchId, vm.data).then(function (res) {
                    console.log(res);
                    if (res.success) {
                        contractService.loadTemplatesForThePoll(activeSurveyID).then(function (res) {
                            if (res.success) {
                                tmpObj.templates = res.data;
                                tmpObj.success = true;
                                $mdDialog.hide(tmpObj);
                            } else {
                                console.log('load templates error');
                            }
                        });
                    } else {
                        console.log('Failed to update contract');
                        toastr.invalid('Failed to create contract');
                        sendStatus = false;
                    }
                });
            }
        };

        vm.saveTemplate = function () {
            if (sendStatus === false) {
                sendStatus = true;
                let CKEditorBody = CKEDITOR.instances.CKeditorArea.getData();
                tmpAnswersArr.forEach(function (item) {
                    CKEditorBody = CKEditorBody.split(item.inEditor).join(item.inServer);
                });

                vm.data.body = "<!doctype html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\"content=\"width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0\"><meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\"><title>Document</title></head><body>" + CKEditorBody + "</body></html>";

                let nameValidation = true;
                if (templates.length) {
                    for (let index in templates) {

                        if (vm.data.title === activeTemplateTitle) {
                            console.log('Old title');
                            break;
                        } else if (templates[index].title === vm.data.title) {
                            nameValidation = false;
                            console.log('validation false');
                            break;
                        }
                    }
                }

                if (vm.templateForm.name.$invalid) {
                    toastr.error('Error invalid data');
                    sendStatus = false;
                } else if (nameValidation === false) {
                    toastr.error('Name already in use');
                    sendStatus = false;
                } else {
                    if (pasteImgBeforeCreateTemplate === true) {
                        // console.log('Условие "картинка до", создание');
                        // console.log('tmpResearchId = ' + tmpResearchId);
                        create(pasteImgBeforeCreateTemplate);
                    } else if (tmpResearchId === undefined) {
                        // console.log('Условие "картинки нет, ресёрча нет", создание');
                        // console.log('tmpResearchId = ' + tmpResearchId);
                        create(pasteImgBeforeCreateTemplate);
                    } else {
                        // console.log('Условие "ресёрч есть", апдейт');
                        // console.log('tmpResearchId = ' + tmpResearchId);
                        console.log(vm.data);
                        contractService.updateTemplate(activeTemplateId, vm.data).then(function (res) {
                            console.log(res);
                            if (res.success) {
                                activeTemplateTitle = res.data.contract.title;
                                contractService.loadTemplatesForThePoll(activeSurveyID).then(function (res) {
                                    if (res.success) {
                                        tmpObj.templates = res.data;
                                        tmpObj.activeTemplateTitle = vm.data.title;
                                        tmpObj.success = true;
                                        $mdDialog.hide(tmpObj);
                                    } else {
                                        console.log('load templates error');
                                    }
                                });
                            } else {
                                console.log('Update template error');
                                toastr.error('Failed to update contract');
                                sendStatus = false;
                            }
                        });
                    }
                }
            }

            function create(img) {
                contractService.createNewResearch().then(function (res) {
                    if (res.success) {
                        tmpResearchId = res.data.id;
                        // console.log('Create research (' + tmpResearchId + ')');
                        // console.log('pasteImgBeforeCreateTemplate === ' + img);
                        if (img === true) {
                            tmpObj.pasteImgBeforeCreateTemplate = false;
                            // console.log('pasteImgBeforeCreateTemplate = false');
                        }

                        console.log(vm.data);
                        contractService.createTemplate(tmpResearchId, vm.data).then(function (res) {
                            console.log(res);
                            if (res.success) {
                                contractService.loadTemplatesForThePoll(activeSurveyID).then(function (res) {
                                    if (res.success) {
                                        tmpObj.templates = res.data;
                                        tmpObj.success = true;
                                        tmpObj.create = true;
                                    } else {
                                        console.log('load templates error');
                                    }
                                });
                                $mdDialog.hide(tmpObj);
                            } else {
                                console.log('Failed to update contract');
                                toastr.invalid('Failed to create contract');
                                sendStatus = false;
                            }
                        });
                    } else {
                        console.log('Create research error');
                        sendStatus = false;
                    }
                });
            }
        };

        vm.saveAsTemplate = function () {
            if (sendStatus === false) {
                sendStatus = true;

                let CKEditorBody = CKEDITOR.instances.CKeditorArea.getData();
                tmpAnswersArr.forEach(function (item) {
                    CKEditorBody = CKEditorBody.split(item.inEditor).join(item.inServer);
                });
                vm.data.body = "<!doctype html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\"content=\"width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0\"><meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\"><title>Document</title></head><body>" + CKEditorBody + "</body></html>";

                let nameValidation = true;
                if (templates.length) {
                    for (let index in templates) {
                        if (templates[index].title === vm.data.title) {
                            nameValidation = false;
                            console.log('validation false');
                            break;
                        }
                    }
                }

                if (vm.templateForm.name.$invalid) {
                    toastr.error('Error invalid data');
                    sendStatus = false;
                } else if (nameValidation === false) {
                    toastr.error('Name already in use');
                    sendStatus = false;
                } else {
                    contractService.createNewResearch().then(function (res) {
                        if (res.success) {
                            tmpResearchId = res.data.id;
                            console.log('Create research (' + tmpResearchId + ')');
                            contractService.createTemplate(tmpResearchId, vm.data).then(function (res) {
                                console.log(res);
                                if (res.success) {
                                    contractService.loadTemplatesForThePoll(activeSurveyID).then(function (res) {
                                        if (res.success) {
                                            tmpObj.templates = res.data;
                                            tmpObj.success = true;
                                        } else {
                                            console.log('load templates error');
                                        }
                                    });
                                    $mdDialog.hide(tmpObj);
                                } else {
                                    console.log('Failed to update contract');
                                    toastr.invalid('Failed to create contract');
                                    sendStatus = false;
                                }
                            });
                        } else {
                            console.log('Create research error');
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