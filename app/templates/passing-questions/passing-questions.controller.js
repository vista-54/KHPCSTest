;(function () {
    'use strict';

    angular.module('app')
        .controller('PassingQuestionController', PassingQuestionController);


    PassingQuestionController.$inject = ['$scope', 'countries', 'passingQuestionService', '$state', 'customers', 'customerAnswer', 'oneSurveyItems', 'toastr', 'tabsService', 'surveyService', 'survey', '$mdDialog', 'contractService'];

    function PassingQuestionController($scope, countries, passingQuestionService, $state, customers, customerAnswer, oneSurveyItems, toastr, tabsService, surveyService, survey, $mdDialog, contractService) {
        let vm = this;
        $scope.$emit('changeTab', 'page6');

        vm.toggle = toggle;
        vm.exists = exists;
        vm.selectedCountryChange = selectedCountryChange;
        vm.next = next;
        vm.back = back;
        vm.checkRadioTreeExample = checkRadioTreeExample;
        vm.downloadPDF = downloadPDF;
        vm.data = [];
        vm.activeSurveyName = oneSurveyItems.name;
        vm.emptySurvey = false;
        vm.backSucces = false;

        let succesNext = true;
        let indexActiveBlock;

        let items = oneSurveyItems;
        let idActiveSurvey = items.id;
        let activeCustomers = customers.getActiveCustomers().id;

        let mainQuestionInBlock;
        let customerAnswerOnActiveBlock;

        let rebootBuilderStatus = false;
        let radioId;
        let lastAnswerIsFinal = false;;

        // Fix from correct paste answer in contract (unicode trouble)
        startupFix();

        function startupFix() {
            angular.forEach(items.blocks, function (block) {
                angular.forEach(block.questions, function (question) {
                    if (question.type === 0 || question.type === 1) {
                        angular.forEach(question.answers, function (answer) {
                            if (typeof answer.answer_text != 'null') {
                                if (typeof answer.answer_text == 'number') {
                                    answer.answer_text = String(answer.answer_text);
                                }
                                answer.answer_text = answer.answer_text.split('&lt;').join('<').split('&gt;').join('>');
                            }
                        });
                    }
                });
            });
        }

        if (customerAnswer != undefined) {
            for (let j = 0; j < customerAnswer.length; j++) {
                if (customerAnswer[j].customerAnswers.length == 0) {
                    for (let i = 0; i < items.blocks.length; i++) {
                        if (customerAnswer[j].block_id == items.blocks[i].id && items.blocks[i].questions.length > 0) {
                            indexActiveBlock = i;
                            break;
                        }
                    }
                    break;
                }
            }
            if (typeof indexActiveBlock == 'undefined') {
                indexActiveBlock = 0;
            }

            generete();
            start();
        }
        else {
            vm.emptySurvey = true;
            // toastr.error('No block in active survey');
        }

        vm.toUserManagement = function () {
            $state.go('tab.user-management');
        };

        vm.cities = countries;
        vm.querySearch = querySearch;

        function querySearch(query) {
            return query ? vm.cities.filter(createFilterFor(query)) : vm.cities;
        }

        function createFilterFor(query) {

            let lowercaseQuery = query.toLowerCase();

            return function filterFn(city) {
                city = city.toLowerCase();
                return (city.indexOf(lowercaseQuery) === 0);
            };
        }

        function toggle(item, list) {
            let idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            }
            else {
                list.push(item);
            }
        }

        function exists(item, list) {
            if (item !== undefined && item !== null && list !== undefined && list !== null) {
                return list.indexOf(item) > -1;
            }
        }

        function generete() {
            mainQuestionInBlock = items.blocks[indexActiveBlock].questions;
            console.log('mainQuestionInBlock', mainQuestionInBlock);

            if (mainQuestionInBlock.length) {
                vm.questions = angular.copy([mainQuestionInBlock[0]]);
                vm.data.push(fill(mainQuestionInBlock[0]));
                chainPreBuilder(vm.questions[0].next_question, vm.questions[0].identifier);
            } else {
                console.log('No questions in block');
                vm.questions = [];
                vm.endOfChain = true;
            }
        }

        function fill(question, radio) {
            // console.log('vm.data (на входе) = ', angular.copy(vm.data));
            let idActiveBlock = items.blocks[indexActiveBlock].id;
            let mainData = {
                answerData: []
            };

            for (let i = 0; i < customerAnswer.length; i++) {
                if (customerAnswer[i].block_id == idActiveBlock) {
                    customerAnswerOnActiveBlock = customerAnswer[i].customerAnswers;
                    break;
                }
            }

            AnswersBuildFunc();

            function AnswersBuildFunc() {
                if (question.type == 0) {
                    mainData.mainData = findAnswerCheckBox(question);
                }
                else if (radio){
                    mainData = findAnswer(question, radio);
                }
                else {
                    mainData.mainData = findAnswer(question);
                }
            }

            function findAnswer(item, radio) {
                for (let i = 0; i < customerAnswerOnActiveBlock.length; i++) {
                    if (customerAnswerOnActiveBlock[i].question_id == item.id) {
                        if (item.type == 1) {
                            if (radio) {
                                return customerAnswerOnActiveBlock[i];
                            } else {
                                return customerAnswerOnActiveBlock[i].answer_id;
                            }
                        } else if (item.type == 2) {
                            return customerAnswerOnActiveBlock[i].value.split('<').join('<').split('>').join('>');
                        } else {
                            return customerAnswerOnActiveBlock[i].value;
                        }
                    }
                }
            }

            function findAnswerCheckBox(item) {
                let mainData = [];

                customerAnswerOnActiveBlock.forEach(function (itemAnswer) {
                    if (itemAnswer.question_id == item.id) {
                        mainData.push(itemAnswer.answer_id);
                    }
                });

                return mainData;
            }

            return mainData;
        }

        function start() {
            vm.header = items.blocks[indexActiveBlock].name;

            if (indexActiveBlock > 0) {
                vm.backSucces = true;
            }
            else {
                vm.backSucces = false;
            }
        }


        function next() {
            succesNext = true;

            // console.log(vm.data, 'all answers in block');
            // console.log(mainQuestionInBlock, 'all question in block');
            // console.log(vm.questions, 'all question in chain');

            let dataForSend = [];

            if (vm.data.length > 0) {
                vm.data.forEach(function (itemQuestion, indexQuestion) {
                    // console.log('vm.data', vm.data);

                    checkForFill(itemQuestion.mainData);

                    if (vm.questions[indexQuestion].type == 1 || vm.questions[indexQuestion].type == 0) {
                        let tmpObj = {};
                        tmpObj.question_id = vm.questions[indexQuestion].id;

                        if (vm.questions[indexQuestion].type == 1) {
                            let id = serchAnswerId(vm.questions[indexQuestion].id);

                            if (id != undefined) {
                                tmpObj.id = id;
                            }
                        }

                        tmpObj.answer_id = itemQuestion.mainData;

                        dataForSend.push(tmpObj);

                        if (vm.questions[indexQuestion].type == 1) {
                            vm.questions[indexQuestion].answers.forEach(function (itemAnswer, indexAnswer) {
                                if (itemAnswer.child_questions.length > 0) {
                                    if (itemQuestion.mainData == itemAnswer.id) {
                                        itemAnswer.child_questions.forEach(function (itemChildQuestion, indexChildQuestion) {
                                            if (typeof itemQuestion.answerData != 'undefined' && typeof itemQuestion.answerData[indexAnswer] != 'undefined') {
                                                let tmpObj = {};
                                                tmpObj.question_id = itemChildQuestion.id;

                                                // if(itemChildQuestion.type == 1){
                                                let id = serchAnswerId(itemChildQuestion.id);

                                                if (id != undefined) {
                                                    tmpObj.id = id;
                                                }
                                                // }

                                                if (itemChildQuestion.type == 1 || itemChildQuestion.type == 0) {
                                                    tmpObj.answer_id = itemQuestion.answerData[indexAnswer].childData[indexChildQuestion];
                                                }
                                                else {
                                                    tmpObj.value = itemQuestion.answerData[indexAnswer].childData[indexChildQuestion];
                                                }

                                                dataForSend.push(tmpObj);

                                                checkForFill(itemQuestion.answerData[indexAnswer].childData[indexChildQuestion]);
                                            }
                                            else {
                                                succesNext = false;
                                            }
                                        });
                                    }
                                    else {
                                        itemAnswer.child_questions.forEach(function (itemChildQuestion) {
                                            let id = serchAnswerId(itemChildQuestion.id);

                                            if (id != undefined) {
                                                let tmpObj = {};
                                                tmpObj.delete = true;
                                                tmpObj.question_id = itemChildQuestion.id;

                                                // if(itemChildQuestion.type == 1){
                                                tmpObj.id = id;
                                                // }
                                                dataForSend.push(tmpObj);
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                    else {
                        let id = serchAnswerId(vm.questions[indexQuestion].id);
                        let tmpObj = {};
                        tmpObj.value = itemQuestion.mainData;
                        tmpObj.question_id = vm.questions[indexQuestion].id;

                        if (id != undefined) {
                            tmpObj.id = id;
                        }

                        dataForSend.push(tmpObj);
                    }
                });
            }
            else {
                succesNext = false;
            }

            // console.log('dataForSend', dataForSend);

            angular.forEach(vm.questions, function (question) {
                if (question.type === 0 && question.mandatory === 1) {
                    angular.forEach(dataForSend, function (dataForSend) {
                        if (dataForSend.question_id === question.id) {
                            if (dataForSend.answer_id.length < 1) {
                                vm.questionForm.$invalid = true;
                            }
                        }
                    })
                }
            });

            if (vm.questionForm.$invalid) {
                toastr.error('All fields must be completed correctly');
            } else {
                if (dataForSend.length) {

                    dataForSend = dataForSend.filter(function (obj) {
                        if (obj.answer_id) {
                            // console.log(dataForSend);
                            if (Array.isArray(obj.answer_id)) {

                                if (obj.answer_id.length === 0) {
                                } else {
                                    return obj;
                                }
                            } else {
                                return obj;
                            }
                        } else {
                            return obj;
                        }
                    });

                    // console.log('dataForSend', dataForSend);
                    if (dataForSend.length) {
                        angular.forEach(dataForSend, function (obj) {
                            if (obj.value) {
                                console.log();
                                if (typeof obj.value !== 'object') {
                                    obj.value = obj.value.split('<').join('&lt;').split('>').join('&gt;');
                                }
                            }
                        });
                        passingQuestionService.sendCustomerAnswer(activeCustomers, dataForSend).then(function (res) {
                            console.log(res);
                            if (res.success) {
                                toNextBlock();
                            }
                        })
                    } else {
                        toNextBlock();
                    }
                } else {
                    toNextBlock();
                }
            }
        }

        function checkForFill(item) {
            if (typeof item == 'undefined' || item == '') {
                succesNext = false;
            }
        }

        function serchAnswerId(idQuestion) {
            for (let i = 0; i < customerAnswerOnActiveBlock.length; i++) {
                if (idQuestion == customerAnswerOnActiveBlock[i].question_id) {
                    return customerAnswerOnActiveBlock[i].id;
                }
            }
        }

        function back() {
            if (indexActiveBlock > 0) {
                indexActiveBlock--;
                generete();
                if (mainQuestionInBlock.length == 0) {
                    if (indexActiveBlock == 0) {
                        toNextBlock();
                    }
                    else {
                        back();
                    }
                }
                else {

                    let id = {
                        customer: activeCustomers,
                        survey: idActiveSurvey
                    };

                    passingQuestionService.getCustomerAnswer(id).then(function (res) {
                        if (res.success) {
                            customerAnswer = res.data.customerAnswers;
                            vm.data = [];
                            generete();
                            start();
                        }
                    });
                }
            }
        }


        let allChosenSurveys = surveyService.getSelectedSurveys();

        function toNextBlock() {
            // console.log(items.blocks);
            if (items.blocks.length - 1 > indexActiveBlock) {
                indexActiveBlock++;
                vm.data = [];
                generete();
                start();
            }
            else {
                let data = {
                    customer_id: activeCustomers,
                    survey_id: idActiveSurvey
                };
                passingQuestionService.createReport(data).then(function (res) {
                    if (res.success) {
                        if (allChosenSurveys.length > 1) {
                            allChosenSurveys.splice([0], 1);
                            survey.selectedSurveys(allChosenSurveys);
                            toastr.success('Has been completed', vm.activeSurveyName);
                            downloadPDF(res);
                            $state.reload();
                        } else {
                            customers.setfinishQuestionair(true);
                            downloadPDF(res);
                            $state.go('tab.user-management');
                            toastr.success('Completed');
                        }
                    }
                    else {
                        console.log('error');
                    }
                })
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function chainPreBuilder(nextQuestion, questionIdentifier, click) {
            // console.log('nextQuestion = ', nextQuestion);
            // console.log('questionIdentifier = ', questionIdentifier);

            let questionsArr = mainQuestionInBlock;
            let tmpNextQuestion = angular.copy(nextQuestion);

            //if chain length > 1  cut out unnecessary data and other...
            if (vm.questions.length > 1) {

                //if next question === null, cut out unnecessary data and allow the end of the questionnaire
                if (nextQuestion === null) {
                    cutOutUnnecessaryData();
                    // console.log('vm.endOfChain = true');
                    vm.endOfChain = true;

                    console.log(angular.copy(vm.questions));
                    // console.log('next question === null');
                    // console.log('chainBuilder off');

                    //else cut out unnecessary data and start chainBuilder func
                } else {
                    cutOutUnnecessaryData();
                    // console.log(angular.copy(vm.questions));
                    // console.log('next question = ', nextQuestion);

                    // console.log('chainBuilder on');
                    chainBuilder(nextQuestion, click);
                }
            // just building a chain
            } else {
                // console.log('vm.questions.length <= 1');
                chainBuilder(nextQuestion, click);
            }

            function cutOutUnnecessaryData() {
                for (let i = 0; i < vm.questions.length; i++) {
                    if (questionIdentifier === vm.questions[i].identifier) {
                        vm.questions.splice(i + 1, vm.questions.length);
                        vm.data.splice(i + 1, vm.data.length);
                    }
                }
            }

            function chainBuilder(nextQuestClick, click) {
                // console.log('click = ', click);
                rebootBuilderStatus = false;
                lastAnswerIsFinal = false;

                for (let a in questionsArr) {
                    if (rebootBuilderStatus) {
                        break;
                    } else {
                        // console.log('a = ', a);
                        for (let b in questionsArr) {

                            //The last question not Radio and he's the last one
                            if (nextQuestClick === null && vm.questions[0].type !== 1) {
                                vm.endOfChain = true;
                                break;
                            }

                            //The !FIRST question is Radio and he's the last one (manual input && qArr have one question)
                            if (nextQuestClick === null && vm.questions[0].type === 1 && questionsArr.length === 1 && click === true) {
                                vm.endOfChain = true;
                                break;
                            }

                            //The !LAST question is Radio and he's the last one (manual input && qArr have one question)
                            if (nextQuestClick === null && vm.questions[vm.questions.length - 1].type === 1 && click === true) {
                                vm.endOfChain = true;
                                break;
                            }

                            // The !LAST answer is final
                            if (lastAnswerIsFinal) {
                                vm.endOfChain = true;
                                break;
                            }
                            // console.log('b = ', b);


                            for (let c in questionsArr) {
                                // console.log('c = ', c);
                                //if a match is found and this type(0,1,2,3,4) "radio(1)"
                                if (tmpNextQuestion === questionsArr[c].identifier && questionsArr[c].type === 1) {
                                    // console.log('radio');
                                    vm.questions.push(questionsArr[c]);
                                    vm.data.push(fill(questionsArr[c]));
                                    let tmpFullAnswer = fill(questionsArr[c], true);

                                    // console.log(angular.copy(vm.questions));
                                    // console.log(angular.copy(vm.data));

                                    if (!vm.data[vm.data.length-1].mainData) {
                                        // console.log('radio no answers');
                                        tmpNextQuestion = null;
                                        vm.endOfChain = false;
                                        break;
                                    } else {
                                        let radioAnswer = angular.copy(tmpFullAnswer);
                                        let question = angular.copy(questionsArr[c]);

                                        tmpNextQuestion = searcherNextQuestionForRadio(radioAnswer, question);
                                        rebootBuilderStatus = true;
                                        break;
                                    }

                                    //if a match is found and this type(0,1,2,3,4) "country(4)"
                                } else if (tmpNextQuestion === questionsArr[c].identifier && questionsArr[c].type === 4) {
                                    // console.log('country');
                                    vm.questions.push(questionsArr[c]);
                                    vm.data.push(fill(questionsArr[c]));

                                    if (!vm.data[vm.data.length-1].mainData) {
                                        // console.log('radio no answers');
                                        tmpNextQuestion = null;
                                        vm.endOfChain = false;
                                        break;
                                    } else {
                                        let countryAnswer = angular.copy(vm.data[vm.data.length-1].mainData);
                                        let question = angular.copy(questionsArr[c]);

                                        tmpNextQuestion = searcherNextQuestionForCountry(countryAnswer, question);
                                        rebootBuilderStatus = true;
                                        break;
                                    }

                                    //if a match is found and this type(0,1,2,3,4) not "radio(1), country(4)", but "checkbox(0), text(2), date(3)"
                                } else if (tmpNextQuestion === questionsArr[c].identifier) {
                                    // console.log('checkbox or text or date');
                                    vm.questions.push(questionsArr[c]);
                                    vm.data.push(fill(questionsArr[c]));
                                    // console.log(vm.data);
                                    // console.log(questionsArr[c].next_question);

                                    if (questionsArr[c].next_question === null) {
                                        // console.log('0,1,3 type question is LAST!');
                                        tmpNextQuestion = null;
                                        vm.endOfChain = true;  // Переменная для показа кнопки [Next] в passing-questions
                                        lastAnswerIsFinal = true;
                                        rebootBuilderStatus = true;
                                        break;
                                    } else {
                                        // console.log('0,1,3 type question have next question');
                                        tmpNextQuestion = questionsArr[c].next_question;
                                    }
                                }
                            }
                        }
                    }
                }
                // console.log('vm.questions', angular.copy(vm.questions));
                // console.log('vm.data', angular.copy(vm.data));
            }

        }

        function searcherNextQuestionForRadio(answer, question) {
            // console.log('searcherNextQuestionForRadio');
            let nextQuestion = undefined;
            let foundNextQuestion = false;

            if (question.answers) {
                for (let i = 0; i < question.answers.length; i++) {
                    let qAnswer = question.answers[i];
                    if (qAnswer.id === answer.answer_id) {
                        nextQuestion = qAnswer.next_question;
                        foundNextQuestion = true;

                        if (nextQuestion == null || nextQuestion == undefined) {
                            // if (nextQuestion === null) {
                            lastAnswerIsFinal = true;
                        }
                        break;
                    }
                }
            }
            // console.log('radio nextQuestion = ', nextQuestion);
            return nextQuestion;
        }

        function searcherNextQuestionForCountry(answer, question) {
            // console.log('searcherNextQuestionForCountry');
            let nextQuestion = undefined;
            let foundNextQuestion = false;

            //checking for the presence of the responses
            if (question.answers) {

                for (let a = 0; a < question.answers.length; a++) {
                    let qAnswer = question.answers[a];
                    // console.log(qAnswer);
                    if (foundNextQuestion) {
                        break;
                    } else {
                        for (let b = 0; b < qAnswer.answer_text.length; b++) {
                            let qAnswerText = qAnswer.answer_text[b];
                            // console.log(qAnswerText);
                            if (qAnswerText === answer) {
                                nextQuestion = qAnswer.next_question;
                                foundNextQuestion = true;

                                if (nextQuestion == null || nextQuestion == undefined) {
                                    // if (nextQuestion === null) {
                                    lastAnswerIsFinal = true;
                                }
                                break;
                            }
                        }
                    }
                }
            }
            if (foundNextQuestion) {
                return nextQuestion;
            } else {
                return question.next_question;
            }
        }

        function checkRadioTreeExample(radio, parentIdentifier, index, manualInput) {
            if (manualInput === true) {
                radioId = radio.id;
                let tmpStatus = false;

                for (let chainIndex in vm.questions) {
                    if (vm.questions[chainIndex].type === 1) {
                        if (radioId == vm.data[chainIndex].mainData) {
                            // console.log('Already in use');
                            tmpStatus = true;
                            break;
                        }
                    }
                }

                if (tmpStatus === false) {
                    chainPreBuilder(radio.next_question, parentIdentifier, manualInput);
                }
            } else {
                radioId = radio.id;
                chainPreBuilder(radio.next_question, parentIdentifier);
            }
        }

        function selectedCountryChange(country, question, index) {
            let questionAnswers = question.answers;
            let parentIdentifier = question.identifier;
            let checkingForAMatch = false;
            let nextQuestionAfterCheck;

            // console.log('country = ', country);
            // console.log('questionAnswers = ', questionAnswers);
            // console.log('parentIdentifier = ', parentIdentifier);
            // console.log('index = ', index);

            if (country) {
                let stop = false;
                for (let i = 0; i < questionAnswers.length; i++) {
                    if (!stop) {
                        for (let x = 0; x < questionAnswers[i].answer_text.length; x++) {
                            if (country === questionAnswers[i].answer_text[x]) {
                                // console.log('Math! -->', country);
                                stop = true;
                                checkingForAMatch = true;
                                nextQuestionAfterCheck = questionAnswers[i].next_question;

                                // countryGroupId = questionAnswers[i].id;
                                // console.log('countryGroupId = ', countryGroupId);
                                // console.log('nextQuestion = ', nextQuestion);
                                break;
                            }
                        }
                    } else {
                        break;
                    }
                }
            }
            if (checkingForAMatch) {
                chainPreBuilder(nextQuestionAfterCheck, parentIdentifier);
            } else {
                chainPreBuilder(question.next_question, parentIdentifier);
            }
        }

        function downloadPDF(res) {

            let dataToDownloadPDF = {
                report_id: res.data.id,
                survey_name: oneSurveyItems.name,
                survey_id: oneSurveyItems.id,
                customer_name: customers.getActiveCustomers().name,
                customer_surname: customers.getActiveCustomers().surname,
            };

            contractService.loadTemplateList().then(function (templateList) {
                let templates = templateList.data.contractsWithoutBody;
                let dataFromDialog = {
                    // customer: customer.name + ' ' + customer.surname,
                    // reports: customer.reports,
                    // surveys: surveys,
                    templates: templates
                };
                downloadContractDialog(dataFromDialog);

                function downloadContractDialog(dataFromDialog) {
                    $mdDialog.show({
                        controller: 'DialogViewController',
                        controllerAs: 'vm',
                        templateUrl: 'components/contract-editor/download-contract/dialog/dialog.html',
                        clickOutsideToClose: true,
                        locals: {
                            dataFromDialog: {
                                // customer: dataFromDialog.customer,
                                // reports: dataFromDialog.reports,
                                // surveys: dataFromDialog.surveys,
                                templates: dataFromDialog.templates,
                                all: dataToDownloadPDF
                            }
                        }
                    });
                }
            });


        }
    }

})();