;(function () {
    'use strict';

    angular.module('app')
        .controller('ContractEditorController', ContractEditorController);


    ContractEditorController.$inject = ['userService', '$mdDialog', 'toastr', 'contractService', 'tabsService', 'surveyService', '$mdSidenav', 'survey', '$scope'];

    function ContractEditorController(userService, $mdDialog, toastr, contractService, tabsService, surveyService, $mdSidenav, survey, $scope) {
        let vm = this;
        tabsService.startTab();
        $scope.$emit('changeTab', 'page4');
        console.log('contract-editor controller start');

        let activeSurveyID;
        let activeSurveyIndex;
        vm.activeSurveyName = undefined;
        let activeBlockId;
        let activeTemplateTitle;
        let tmpResearchId;
        let deletedUserVar = [];
        let tmpAnswersArr = [];
        let tmpImagesArr = [];
        let pasteImgBeforeCreateTemplate = false;
        vm.activeTemplateId = undefined;
        vm.fileName = 'Choose File';
        let image = document.getElementById('file');
        vm.showEditor = false;
        vm.showSurveysList = true;
        vm.surveys = [];
        userService.loadSurveysOnly().then(function (res) {
            if (res.success) {
                vm.surveys = res.data.onlySurvey;
                console.log(vm.surveys);

                if (vm.surveys.length) {

                    for (let i = 0; i < vm.surveys.length; i++) {
                        if (vm.surveys[i].survey_status === 'active' || vm.surveys[i].survey_status === 'inactive') {
                            activeSurveyID = vm.surveys[i].survey_id;
                            vm.activeSurveyName = vm.surveys[i].survey_name;
                            break;
                        }
                    }

                    loadOneSurvey(activeSurveyID);
                    loadTemplates(activeSurveyID);
                    loadAllUserVariability();
                    CKEDITOR.instances.CKeditorArea.setData('');
                }
            } else {
                console.log('load surveys error');
            }
        });

        console.log(vm.surveys);


        function loadOneSurvey(id) {
            surveyService.loadOneSurvey(id).then(function (survey) {
                if (survey.success) {
                    vm.activeSurvey = survey.data.survey.blocks;
                    console.log(vm.activeSurvey, 'vm.activeSurvey');

                    let numberInOrder = 0;
                    vm.activeSurvey.forEach(function (block) {
                        block.questions.forEach(function (question) {
                            numberInOrder++;
                            question.numberInOrder = numberInOrder;
                            // console.log(question.id + '-->' + question.numberInOrder);
                            question.answers.forEach(function (answer) {
                                answer.child_questions.forEach(function (childQuestion) {
                                    numberInOrder++;
                                    childQuestion.numberInOrder = numberInOrder;
                                    // console.log(childQuestion.id + '-->' + childQuestion.numberInOrder);
                                });
                            });
                        });
                    });
                } else {
                    console.log('load survey error');
                }
            });
        }
        function loadAllUserVariability() {
            contractService.getVariabilityWithDeleted().then(function (res) {
                if (res.success) {
                    vm.variability = [];

                    res.data.forEach(function (cell) {
                        if (cell.deleted_at === null) {
                            vm.variability.push(cell);
                        } else {
                            deletedUserVar.push(cell)
                        }
                    });
                    console.log(vm.variability, 'vm.variability');
                    // console.log(deletedUserVar, 'deletedUserVar');
                } else {
                    console.log('load variability error');
                }
            });
        }

        function loadTemplates(id) {
            contractService.loadTemplatesForThePoll(id).then(function (res) {
                if (res.success) {
                    vm.templates = res.data;
                    console.log(vm.templates, 'vm.templates');
                } else {
                    console.log('load templates error');
                }
            });
        }

        CKEDITOR.replace('CKeditorArea');



        CKEDITOR.addCss('body{width: 21cm;min-height: 29.7cm;border: 1px #D3D3D3 solid;box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);padding: 2cm; box-sizing: border-box; margin: 0 auto; font-family: -webkit-pictograph; font-size: 15px !important;line-height: 1.2 !important}');
        CKEDITOR.addCss('body p{margin: 5px 0;}');
        CKEDITOR.addCss('span[lang]{font-style: normal !important;}');

        vm.showTemplates = function (id) {
            if (id === activeSurveyID){
                return true;
            } else {
                return false;
            }
        };
        vm.showSelectedSurvey = function (id) {
            if (id === activeSurveyID) {
                return true;
            } else {
                return false;
            }
        };
        vm.showSelectedTemplate = function (id) {
            if (id === vm.activeTemplateId) {
                return true;
            } else {
                return false;
            }
        };

        //////////////////////////Поблочный просмотр вопросов(+Тригер)/////////////////

        vm.showQuestionsInBlock = function (idCurrentBlock) {
            if (activeBlockId === idCurrentBlock){
                activeBlockId = undefined;
            } else  {
                activeBlockId = idCurrentBlock;
            }
        };

        vm.showQuestions = function (id) {
            if (activeBlockId === id){
                return true;
            } else {
                return false;
            }
        };

        ///////////////////////////////////////////////////////////////////////////////

        vm.setActiveSurvey = function setActiveSurvey(id, name, index) {
            CKEDITOR.instances.CKeditorArea.setData('');
            activeSurveyID = id;
            activeSurveyIndex = index;
            vm.activeSurveyName = name;
            pasteImgBeforeCreateTemplate = false;
            tmpResearchId = undefined;
            vm.activeTemplateId = undefined;
            activeTemplateTitle = undefined;

            vm.showEditor = true;
            vm.showSurveysList = false;

            loadOneSurvey(activeSurveyID);
            loadTemplates(activeSurveyID);
        };

        vm.changeSurvey = function () {
            vm.showEditor = false;
            vm.showSurveysList = true;
        };

        vm.pasteTitle = function (data) {
            CKEDITOR.instances.CKeditorArea.insertText(data);
        };

        vm.pasteVariability = function (title, id, numberInOrder) {
            let surveyVarInEditorSide = '[[Answer ' + numberInOrder + ']]';
            let surveyVarInServerSide = '{!!$contractAnswers[' + id + ']!!}';
            let tmpVarObj = {
                inServer: surveyVarInServerSide,
                inEditor: surveyVarInEditorSide
            };

            CKEDITOR.instances.CKeditorArea.insertText(surveyVarInEditorSide + ' ');

            let coincidence = false;
            if (!tmpAnswersArr.length) {
                tmpAnswersArr.push(tmpVarObj);
            } else {
                tmpAnswersArr.forEach(function (item) {
                    if (item.inServer === surveyVarInServerSide) {
                        coincidence = true;
                    }
                });

                if (coincidence === false) {
                    tmpAnswersArr.push(tmpVarObj);
                }
            }
        };

        /////////////////////////Работа с шаблонами////////////////////////////////////

        vm.pasteTemplate = function (data) {
            CKEDITOR.instances.CKeditorArea.setData("");
            let deletedQuestionInSurvey;
            vm.activeTemplateId = data.id;
            activeTemplateTitle = data.title;
            tmpAnswersArr = [];
            tmpImagesArr = [];
            pasteImgBeforeCreateTemplate = false;

            contractService.loadOneTemplate(vm.activeTemplateId).then(function (template) {
                if (template.success) {
                    let body = template.data.contract.body.replace("<!doctype html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\"content=\"width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0\"><meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\"><title>Document</title></head><body>", "").replace("</body></html>", "");
                    tmpResearchId = template.data.contract.contract_research_id;
                    console.log('Research = ' + tmpResearchId);

                    surveyService.loadDeletedQuestionsInSurvey(activeSurveyID).then(function (questions) {
                        if (questions.success) {
                            deletedQuestionInSurvey = questions.data.deletedQuestions;

                            vm.activeSurvey.forEach(function (block) {
                                block.questions.forEach(function (question) {
                                    let surveyVarInServerSide = '{!!$contractAnswers[' + question.id + ']!!}';
                                    if (body.indexOf(surveyVarInServerSide) !== -1) {
                                        let surveyVarInEditorSide = '[[Answer ' + question.numberInOrder + ']]';
                                        let tmpVarObj = {
                                            inServer: surveyVarInServerSide,
                                            inEditor: surveyVarInEditorSide
                                        };
                                        tmpAnswersArr.push(tmpVarObj);
                                        body = body.split(surveyVarInServerSide).join(surveyVarInEditorSide);
                                    }
                                    question.answers.forEach(function (answer) {
                                        answer.child_questions.forEach(function (childQuestion) {
                                            let surveyVarInServerSide = '{!!$contractAnswers[' + childQuestion.id + ']!!}';
                                            if (body.indexOf(surveyVarInServerSide) !== -1) {
                                                let surveyVarInEditorSide = '[[Answer ' + childQuestion.numberInOrder + ']]';
                                                let tmpVarObj = {
                                                    inServer: surveyVarInServerSide,
                                                    inEditor: surveyVarInEditorSide
                                                };
                                                tmpAnswersArr.push(tmpVarObj);
                                                body = body.split(surveyVarInServerSide).join(surveyVarInEditorSide);
                                            }
                                        });
                                    });
                                });
                            });

                            deletedQuestionInSurvey.forEach(function (questionID) {
                                let surveyVarInServerSide = '{!!$contractAnswers[' + questionID + ']!!}';
                                if (body.indexOf(surveyVarInServerSide) !== -1) {
                                    let surveyVarInEditorSide = '<span style="background-color: red">Question was deleted</span>';
                                    let tmpVarObj = {
                                        inServer: surveyVarInServerSide,
                                        inEditor: surveyVarInEditorSide
                                    };
                                    tmpAnswersArr.push(tmpVarObj);
                                    body = body.split(surveyVarInServerSide).join(surveyVarInEditorSide);
                                }
                            });

                            (function () {
                                vm.variability.forEach(function (variability) {
                                    let userVarInServerSide;
                                    let userVarInEditorSide;

                                    userVarInServerSide = '{!!$userVariables[' + variability.id + ']!!}';

                                    if (body.indexOf(userVarInServerSide) !== -1) {
                                        userVarInEditorSide = '[[User var ' + variability.id + ']]';

                                        let tmpVarObj = {
                                            inServer: userVarInServerSide,
                                            inEditor: userVarInEditorSide
                                        };
                                        body = body.split(userVarInServerSide).join(userVarInEditorSide);
                                        tmpAnswersArr.push(tmpVarObj);
                                    }
                                });

                                deletedUserVar.forEach(function (variability) {
                                    let userVarInServerSide;
                                    let userVarInEditorSide;

                                    userVarInServerSide = '{!!$userVariables[' + variability.id + ']!!}';

                                    if (body.indexOf(userVarInServerSide) !== -1) {
                                        userVarInEditorSide = '<span style="background-color: red">Variability ' + variability.id + ' was deleted</span>';

                                        let tmpVarObj = {
                                            inServer: userVarInServerSide,
                                            inEditor: userVarInEditorSide
                                        };
                                        body = body.split(userVarInServerSide).join(userVarInEditorSide);
                                        tmpAnswersArr.push(tmpVarObj);
                                    }
                                });
                            })();


                            (function () {
                                let staticVarArr = [{serverSide: '{!! $user["name"] !!}', editorSide: '[[user name]]'},
                                    {serverSide: '{!! $user["email"] !!}', editorSide: '[[user email]]'},
                                    {serverSide: '{!! $customer["name"] !!}', editorSide: '[[customer name]]'},
                                    {serverSide: '{!! $customer["surname"] !!}', editorSide: '[[customer surname]]'},
                                    {serverSide: '{!! $customer["classification"] !!}', editorSide: '[[customer classification]]'},
                                ];

                                let userVarInEditorSide;
                                let userVarInServerSide;

                                staticVarArr.forEach(function (staticVar) {
                                    if (body.indexOf(staticVar.serverSide) !== -1) {
                                        userVarInEditorSide = staticVar.editorSide;
                                        userVarInServerSide = staticVar.serverSide;
                                        let tmpVarObj = {
                                            inServer: userVarInServerSide,
                                            inEditor: userVarInEditorSide
                                        };
                                        tmpAnswersArr.push(tmpVarObj);
                                        body = body.split(userVarInServerSide).join(userVarInEditorSide);
                                    }
                                });
                                console.log(tmpAnswersArr);
                            }());

                            (function () {
                                contractService.imageListInResearch(vm.activeTemplateId).then(function (res) {
                                    let imageList = res.imageList;
                                    console.log(imageList);
                                    imageList.forEach(function (cell) {
                                        if (body.indexOf(cell.link) === -1) {
                                            console.log('Image ' + cell.id + ' is not used and will be deleted');
                                            contractService.deleteImage(cell.id).then(function (res) {
                                                console.log(res.image);
                                            });
                                        }
                                    });
                                });
                            }());
                            // console.log(tmpAnswersArr);
                            CKEDITOR.instances.CKeditorArea.setData(body);
                            // console.log(body);

                        }else{
                            console.log('load RemovedQuestionsList error');
                        }
                    });
                }else{
                    console.log('load Template error');
                }
            });
        };

        vm.createTemplate = function () {
            $mdDialog.show({
                controller: 'AddUpdateTemplateController',
                controllerAs: 'vm',
                templateUrl: 'components/contract-editor/add-or-update-template/add-or-update-template.html',
                clickOutsideToClose: true,
                locals : {
                    data: {
                        type: 'create',
                        activeSurveyID: activeSurveyID,
                        tmpAnswersArr: tmpAnswersArr,
                        templates: vm.templates,
                        pasteImgBeforeCreateTemplate: pasteImgBeforeCreateTemplate,
                        tmpResearchId: tmpResearchId
                    }
                }
            }).then(function (res) {
                console.log(res);
                if (res.success === true) {
                    vm.templates = res.templates;
                    console.log(vm.templates, 'vm.templates');
                    CKEDITOR.instances.CKeditorArea.setData('');
                    vm.activeTemplateId = vm.templates[vm.templates.length - 1].id;
                    activeTemplateTitle = vm.templates[vm.templates.length - 1].title;
                    if (tmpImagesArr.length) {
                        console.log('tmpImagesArr не пуст');
                        tmpImagesArr.forEach(function (cell) {
                            console.log(cell.link);
                            let CKEditorBody = CKEDITOR.instances.CKeditorArea.getData();
                            if (CKEditorBody.indexOf(cell.link) === -1) {
                                console.log('Image ' + cell.id + ' is not used and will be deleted');
                                contractService.deleteImage(cell.id);
                            }
                        });
                        pasteImgBeforeCreateTemplate = false;
                        tmpImagesArr = [];
                    }
                }
            }, function () {

            });
        };

        vm.saveTemplate = function () {

            $mdDialog.show({
                controller: 'AddUpdateTemplateController',
                controllerAs: 'vm',
                templateUrl: 'components/contract-editor/add-or-update-template/add-or-update-template.html',
                clickOutsideToClose: true,
                locals: {
                    data: {
                        type: 'save',
                        activeTemplateId: vm.activeTemplateId,
                        activeSurveyID: activeSurveyID,
                        tmpAnswersArr: tmpAnswersArr,
                        activeTemplateTitle: activeTemplateTitle,
                        templates: vm.templates,
                        tmpResearchId: tmpResearchId,
                        pasteImgBeforeCreateTemplate: pasteImgBeforeCreateTemplate
                    }
                }
            }).then(function (res) {
                console.log(res);
                if (res.success === true) {
                    vm.templates = res.templates;
                    pasteImgBeforeCreateTemplate = res.pasteImgBeforeCreateTemplate;
                    activeTemplateTitle = res.activeTemplateTitle;
                    if (res.create) {
                        vm.activeTemplateId = vm.templates[vm.templates.length - 1].id;
                        activeTemplateTitle = vm.templates[vm.templates.length - 1].title;
                    }
                }

                if (tmpImagesArr.length) {
                    tmpImagesArr.forEach(function (cell) {
                        // console.log(cell.link);
                        let CKEditorBody = CKEDITOR.instances.CKeditorArea.getData();
                        if (CKEditorBody.indexOf(cell.link) === -1) {
                            console.log('Image ' + cell.id + ' is not used and will be deleted');
                            contractService.deleteImage(cell.id);
                        }
                    });
                    tmpImagesArr = [];
                }
            }, function () {

            });
        };

        vm.saveAsTemplate = function () {
            $mdDialog.show({
                controller: 'AddUpdateTemplateController',
                controllerAs: 'vm',
                templateUrl: 'components/contract-editor/add-or-update-template/add-or-update-template.html',
                clickOutsideToClose: true,
                locals: {
                    data: {
                        type: 'saveAs',
                        activeTemplateId: vm.activeTemplateId,
                        activeSurveyID: activeSurveyID,
                        tmpAnswersArr: tmpAnswersArr,
                        activeTemplateTitle: activeTemplateTitle,
                        templates: vm.templates,
                    }
                }
            }).then(function (res) {
                console.log(res);
                if (res.success === true) {
                    vm.templates = res.templates;
                }

                if (tmpImagesArr.length) {
                    tmpImagesArr.forEach(function (cell) {
                        // console.log(cell.link);
                        let CKEditorBody = CKEDITOR.instances.CKeditorArea.getData();
                        if (CKEditorBody.indexOf(cell.link) === -1) {
                            console.log('Image ' + cell.id + ' is not used and will be deleted');
                            contractService.deleteImage(cell.id);
                        }
                    });
                    tmpImagesArr = [];
                }
            }, function () {

            });
        };

        vm.removeTemplate = function (id) {
            $mdDialog.show({
                controller: 'RemoveTemplateController',
                controllerAs: 'vm',
                templateUrl: 'components/delete-view/delete-view.html',
                clickOutsideToClose: true,
                locals: {
                    data: {
                        templateID: id,
                        activeSurveyID: activeSurveyID
                    }
                }
            }).then(function (res) {
                // console.log(res);
                if (res.success === true) {
                    CKEDITOR.instances.CKeditorArea.setData("");

                    vm.templates = res.templates;
                    console.log(vm.templates, ' vm.templates');
                    vm.activeTemplateId = undefined;
                    activeTemplateTitle = undefined;
                    tmpResearchId = undefined;
                    pasteImgBeforeCreateTemplate = false;
                }
            }, function () {

            });
        };


        //////////////////////Работа с пользовательскими переменными///////////////////

        vm.toSurney = function () {
            tabsService.startTab('page3');
            survey.setActiveSurvey(activeSurveyID, activeSurveyIndex);

        };

        vm.pasteStaticVariability = function (data) {
            let userVarInEditorSide;
            let userVarInServerSide;

            if (data === 'User name') {
                userVarInEditorSide = '[[user name]]';
                userVarInServerSide = '{!! $user["name"] !!}';
            } else if (data === 'User email') {
                userVarInEditorSide = '[[user email]]';
                userVarInServerSide = '{!! $user["email"] !!}';
            } else if (data === 'Customer name') {
                userVarInEditorSide = '[[customer name]]';
                userVarInServerSide = '{!! $customer["name"] !!}';
            } else if (data === 'Customer surname') {
                userVarInEditorSide = '[[customer surname]]';
                userVarInServerSide = '{!! $customer["surname"] !!}';
            } else if (data === 'Customer classification') {
                userVarInEditorSide = '[[customer classification]]';
                userVarInServerSide = '{!! $customer["classification"] !!}';
            }

            let tmpVarObj = {
                inServer: userVarInServerSide,
                inEditor: userVarInEditorSide
            };

            CKEDITOR.instances.CKeditorArea.insertText(userVarInEditorSide + ' ');

            let coincidence = false;
            if (!tmpAnswersArr.length) {
                tmpAnswersArr.push(tmpVarObj);
            } else {
                tmpAnswersArr.forEach(function (item) {
                    if (item.inServer === userVarInServerSide) {
                        coincidence = true;
                    }
                });

                if (coincidence === false) {
                    tmpAnswersArr.push(tmpVarObj);
                }
            }
        };

        vm.pasteUserVariability = function (id) {
            let userVarInEditorSide = '[[User var ' + id + ']]';
            let userVarInServerSide = '{!!$userVariables[' + id + ']!!}';
            let tmpVarObj = {
                inServer: userVarInServerSide,
                inEditor: userVarInEditorSide
            };

            CKEDITOR.instances.CKeditorArea.insertText('[[User var ' + id + ']] ');

            let coincidence = false;
            if (!tmpAnswersArr.length) {
                tmpAnswersArr.push(tmpVarObj);
            } else {
                tmpAnswersArr.forEach(function (item) {
                    if (item.inServer === userVarInServerSide) {
                        coincidence = true;
                    }
                });

                if (coincidence === false) {
                    tmpAnswersArr.push(tmpVarObj);
                }
            }
        };

        vm.createUserVariability = function () {

            $mdDialog.show({
                controller: 'AddUpdateUserVarController',
                controllerAs: 'vm',
                templateUrl: 'components/contract-editor/add-or-update-user-variability/add-or-update-user-variability.html',
                clickOutsideToClose: true,
                locals: {
                    data: {
                        type: 'create'
                    }
                }
            }).then(function (res) {
                console.log(res);
                if (res.success === true) {
                    vm.variability = res.notDeletedVariability;
                    deletedUserVar = res.deletedVariability;
                    console.log('success true');
                }
            }, function () {

            });
        };

        vm.editUserVariability = function (id, data) {

            $mdDialog.show({
                controller: 'AddUpdateUserVarController',
                controllerAs: 'vm',
                templateUrl: 'components/contract-editor/add-or-update-user-variability/add-or-update-user-variability.html',
                clickOutsideToClose: true,
                locals: {
                    data: {
                        type: 'update',
                        text: data,
                        id: id
                    }
                }
            }).then(function (res) {
                console.log(res);
                if (res.success === true) {
                    vm.variability = res.notDeletedVariability;
                    deletedUserVar = res.deletedVariability;
                    console.log('success true');
                }
            }, function () {

            });
        };

        vm.removeUserVariability = function (id) {

            $mdDialog.show({
                controller: 'RemoveUserVarController',
                controllerAs: 'vm',
                templateUrl: 'components/delete-view/delete-view.html',
                clickOutsideToClose: true,
                locals: {
                    data: {
                        id: id
                    }
                }
            }).then(function (res) {
                console.log(res);
                if (res.success === true) {
                    vm.variability = res.notDeletedVariability;
                    deletedUserVar = res.deletedVariability;
                    console.log('success true');
                }
            }, function () {

            });
        };

        ////////////////////////////////Image//////////////////////////////////////////

        vm.sendImage = function () {
            if (tmpResearchId === undefined) {
                contractService.createNewResearch().then(function (res) {
                    tmpResearchId = res.data.id;
                    pasteImgBeforeCreateTemplate = true;
                    console.log('pasteImgBeforeCreateTemplate = true;');
                    console.log('Research = ' + tmpResearchId);

                    sendImg();
                });
            } else {
                sendImg();
            }

            function sendImg() {
                let fd = new FormData();
                fd.append('image_file', image.files[0]);
                let xhttp = new XMLHttpRequest();

                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        console.log('done');
                        let data = JSON.parse(this.response);
                        console.log(data);
                        CKEDITOR.instances.CKeditorArea.insertHtml('<img src="' + data.image.link + '" alt="Image" style="max-width: 17cm">&nbsp');
                        let tmpImgObj = {
                            id: data.image.id,
                            link: data.image.link
                        };
                        tmpImagesArr.push(tmpImgObj);
                        console.log(tmpImagesArr);
                    }
                };

                xhttp.open("POST", contractService.uploadImage(tmpResearchId), fd, true);
                xhttp.setRequestHeader("token", userService.getToken());
                xhttp.send(fd);
            }
        };

        //Upload image without confirm
        image.addEventListener("change" , function() {
            if (image.files.length) {
                if (image.files[0].type.indexOf('image') !== -1) {
                    // console.log(image.files[0]);
                    vm.sendImage();
                } else {
                    toastr.error('The selected file should be a picture');
                }
            }
        });

        // __________________________

        vm.activeTabName = 'Templates';


        vm.setActiveTabName = function (name) {
            if(name !== vm.activeTabName){
                vm.activeTabName = name;
            }
        };

        vm.isActiveTab = function (name) {
            if (vm.activeTabName === name){
                return true
            } else {
                return false
            }
        };

        vm.toggleLeftTab = toggleLeftTab;

        function toggleLeftTab() {
            $mdSidenav('left-tab').toggle();
        }
    }
})();