;(function () {
    'use strict';
    angular
        .module('app')
        .controller('SurveyQuestionController', SurveyQuestionController);

    SurveyQuestionController.$inject = ['survey', '$scope', '$mdDialog', 'blockService', 'toastr', 'items', '$state', '$timeout', 'countries'];

    function SurveyQuestionController(survey, $scope, $mdDialog, blockService, toastr, items, $state, $timeout, countries) {
        let vm = this;
        $scope.$emit('changeTab', 'page3');

        $scope.$on('setBlockName', function (event, data) {
            vm.nameBlock = data;
        });
        $scope.$on('setItems', function (event, data) {
            items = data;
        });

        let activeBlock = survey.getActiveBlock();
        let indexBlock = activeBlock.indexBlock;
        let idBlock = activeBlock.id;
        let loopingValid;

        vm.data = [];
        vm.items = items[indexBlock].questions;
        vm.nameBlock = items[indexBlock].name;
        vm.edit = false;

        vm.drag = true;

        vm.exampleAnswers = [];
        // vm.cancel = cancel;
        // vm.save = save;
        vm.showEdit = showEdit;
        vm.deleteQuest = deleteQuest;
        vm.toggleLeft = toggleLeft;
        vm.editButton = editButton;
        vm.mandatoryChecked = mandatoryChecked;
        vm.mandatoryCheck = mandatoryCheck;
        vm.changeNextQuest = changeNextQuest;
        vm.startupChainBuild = startupChainBuild;
        vm.copyQuest = copyQuest;
        vm.checkKey = checkKey;
        vm.selectedCountryChange = selectedCountryChange;
        vm.querySearch = querySearch;
        vm.cities = countries;

        $scope.$on('setActiveBlock', function (event, data) {
            activeBlock = data.activeBlock;
            indexBlock = activeBlock.indexBlock;
            idBlock = activeBlock.id;

            vm.items = items[indexBlock].questions;
            vm.nameBlock = items[indexBlock].name;
            if (!vm.drag) {
                vm.drag = !vm.drag;
            }
        });

        // Fix from correct paste answer in contract
        startupFix();

        function startupFix() {
            angular.forEach(vm.items, function (question) {
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
        }

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

        function toggleLeft() {
            $scope.$emit('showBlock', true);
        }

        function editButton() {
            vm.drag = !vm.drag;

            vm.sortableOptionsQuestion.disabled = vm.drag;
            vm.sortableOptionCheckBox = vm.drag;
            vm.sortableOptionAnswer.disabled = vm.drag;
            vm.sortableOptionsQuestionInAnswer.disabled = vm.drag;
            vm.sortableOptionChildAnswer.disabled = vm.drag;
        }

        vm.sortableOptionsQuestion = {
            disabled: vm.drag,
            connectWith: ".question-container",
            'ui-floating': true,

            start: function (e, ui) {
                $scope.$apply(function () {
                    vm.childDraging = true;
                });
            },
            update: function (event, ui) {
                let droptargetModel = ui.item.sortable.droptargetModel;
                let model = ui.item.sortable.model;

                let succes = true;

                if (droptargetModel.length > 0) {
                    for (let i = 0; i < droptargetModel.length; i++) {
                        if (droptargetModel[i] == model) {
                            succes = false;
                            break
                        }
                    }
                }
                else {
                    succes = true;
                }

                if (succes) {
                    if (typeof model.answers != 'undefined' && model.type == 1) {
                        answers: for (let i = 0; i < model.answers.length; i++) {
                            if (typeof model.answers[i].child_questions != 'undefined') {
                                if (model.answers[i].child_questions.length > 0) {
                                    for (let j = 0; j < model.answers[i].child_questions.length; j++) {
                                        if (typeof model.answers[i].child_questions[j].delete == 'undefined') {
                                            ui.item.sortable.cancel();
                                            toastr.error('Can not contain questions');
                                            break answers;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            stop: function (e, ui) {
                vm.childDraging = vm.drag;
                save();
            }
        };
        vm.sortableOptionAnswer = {
            disabled: vm.drag,
            'ui-floating': true,
            stop: function (e, ui) {
                save();
            }
        };
        vm.sortableOptionsQuestionInAnswer = {
            disabled: vm.drag,
            connectWith: ".question-container",
            'ui-floating': true,

            start: function (e, ui) {
                $scope.$apply(function () {
                    vm.childDraging = true;
                });
            },
            update: function (e, ui) {
                console.log('update', vm.childDraging);
            },
            stop: function (e, ui) {
                vm.childDraging = false;
                save();
            }

        };
        vm.sortableOptionChildAnswer = {
            disabled: vm.drag,
            'ui-floating': true,
            stop: function (e, ui) {
                save();
            }
        };

        function save() {
            let dataForSend = angular.copy(vm.items);

            if (dataForSend.length > 0) {
                dataForSend.forEach(function (itemQuestion, indexQuestion) {
                    itemQuestion.order_number = indexQuestion;
                    itemQuestion.child_order_number = null;
                    if (itemQuestion.type == 1 || itemQuestion.type == 0) {
                        itemQuestion.answers.forEach(function (itemAnswer, indexAnswer) {
                            itemAnswer.order_number = indexAnswer;
                            itemAnswer.child_questions.forEach(function (itemQuestionInAnswer, indexQuestionInAnswer) {
                                itemQuestionInAnswer.child_order_number = indexQuestionInAnswer;
                                itemQuestionInAnswer.order_number = null;
                                if (itemQuestionInAnswer.type == 1 || itemQuestionInAnswer.type == 0) {
                                    itemQuestionInAnswer.answers.forEach(function (itemAnswerInChildQuestion, indexAnswerInChildQuestion) {
                                        itemAnswerInChildQuestion.order_number = indexAnswerInChildQuestion;
                                        if (typeof itemQuestionInAnswer.id != 'undefined') {
                                            itemAnswerInChildQuestion.question_id = itemQuestionInAnswer.id;
                                        }
                                    });
                                }
                            });
                        });
                    }
                });

                blockService.addBlockQuestion(idBlock, dataForSend).then(function (res) {
                    if (res.success) {
                        vm.items = res.data.questions;
                        items[indexBlock].questions = res.data.questions;
                    }
                });
            }
        }

        function deleteQuest(id, mainKey, answerKey, questionKey) {
            $mdDialog.show({
                controller: 'DeleteViewController',
                controllerAs: 'vm',
                templateUrl: 'components/delete-view/delete-view.html',
                clickOutsideToClose: true
            }).then(function () {
                if (typeof questionKey != 'undefined') {
                    if (typeof id == 'undefined') {
                        vm.items[mainKey].answers[answerKey].child_questions.splice(questionKey, 1);
                    }
                    else {
                        // vm.items[mainKey].answers[answerKey].child_questions[questionKey].delete = true;

                        let dataForSend = [{
                            id: vm.items[mainKey].answers[answerKey].child_questions[questionKey].id,
                            delete: true
                        }];

                        blockService.addBlockQuestion(idBlock, dataForSend).then(function (res) {
                            if (res.success) {
                                vm.items[mainKey].answers[answerKey].child_questions.splice(questionKey, 1);
                                $scope.$emit('changeItems', vm.items);
                            }
                        });
                    }

                }
                else {
                    if (typeof id == 'undefined') {
                        vm.items.splice(mainKey, 1);
                    }
                    else {
                        // vm.items[mainKey].delete = true;

                        let dataForSend = {
                            id: vm.items[mainKey].id,
                            question: vm.items[mainKey],
                            delete: true
                        };
                        vm.oldQuestion = dataForSend.question;
                        blockService.addBlockQuestion(idBlock, [dataForSend]).then(function (res) {
                            if (res.success) {
                                angular.forEach(vm.items, function (question) {
                                    if (question.type !== 1 && question.next_question === vm.oldQuestion.identifier) {
                                        question.next_question = null;
                                        blockService.addBlockQuestion(idBlock, [question]);
                                    } else {
                                        angular.forEach(question.answers, function (answer) {
                                            if (answer.next_question === vm.oldQuestion.identifier) {
                                                answer.next_question = null;
                                                blockService.addBlockQuestion(idBlock, [question]);
                                            }
                                        })
                                    }
                                });

                                vm.items.splice(mainKey, 1);
                                $scope.$emit('changeItems', vm.items);
                            }
                        });
                    }
                }
            }, function () {

            });
        }

        function showEdit(mainKey, answerKey, questionKey) {
            $mdDialog.show({
                controller: 'AddQuestionController',
                controllerAs: 'vm',
                locals: {
                    data: {
                        mainKey: mainKey,
                        answerKey: answerKey,
                        questionKey: questionKey,
                        items: vm.items,
                        idBlock: idBlock
                    }
                },
                templateUrl: 'components/survey-question/add-quest/add-quest.html',
                clickOutsideToClose: true,
            }).then(function () {
                $scope.$emit('changeItems', vm.items);
            });
        }

        console.log('vm.items ', vm.items);

        startupChainBuild();

        function startupChainBuild() {
            vm.chain = [];
            if (vm.items.length) {
                vm.chain = [vm.items[0]];
                chain(vm.chain[0].next_question);
                fill();
            }
        }


        let dataObj = {answer: undefined};
        vm.data.push(dataObj);

        function chain(nextQuestion, questionIdentifier) {
            let questionsArr = vm.items;
            let tmpNextQuestion = nextQuestion;

            if (vm.chain.length > 1) {
                if (nextQuestion === null) {
                    for (let index = 0; index < vm.chain.length; index++) {
                        if (questionIdentifier === vm.chain[index].identifier) {
                            vm.chain.splice(index + 1, vm.chain.length);
                            vm.data.splice(index + 1, vm.data.length);
                            // console.log(vm.chain);
                            chainBuilder(nextQuestion);
                        }
                    }
                } else {
                    if (vm.chain[vm.chain.length - 1].identifier !== nextQuestion.identifier) {
                        for (let index = 0; index < vm.chain.length; index++) {
                            if (questionIdentifier === vm.chain[index].identifier) {
                                vm.chain.splice(index + 1, vm.chain.length);
                                vm.data.splice(index + 1, vm.data.length);
                                // console.log(vm.chain);
                                chainBuilder(nextQuestion);
                            }
                        }
                    }
                }

            } else {
                chainBuilder(nextQuestion);
            }

            function chainBuilder(nextQuestClick) {
                let dataObj = {answer: undefined};

                for (let x in questionsArr) {
                    if (nextQuestClick === null) {
                        vm.endOfChain = true;  // Переменная для показа кнопки [Next] в passing-questions
                        break;
                    }
                    if (tmpNextQuestion === null) {
                        break;
                    }
                    for (let i in questionsArr) {
                        if (tmpNextQuestion === questionsArr[i].identifier && questionsArr[i].type !== 1) {
                            vm.chain.push(questionsArr[i]);
                            vm.data.push(dataObj);
                            if (questionsArr[i].next_question === null) {
                                tmpNextQuestion = null;
                                vm.endOfChain = true;  // Переменная для показа кнопки [Next] в passing-questions
                                break;
                            } else {
                                tmpNextQuestion = questionsArr[i].next_question;
                            }
                        } else if (tmpNextQuestion === questionsArr[i].identifier && questionsArr[i].type === 1) {
                            vm.chain.push(questionsArr[i]);
                            vm.data.push(dataObj);
                            tmpNextQuestion = null;
                            vm.endOfChain = false;
                            break;
                        }
                    }
                }
                console.log('vm.chain', vm.chain);
            }
        }

        function fill(index) {
            if (!vm.items.length) {
                return false;
            }
            if (index === undefined) {
                vm.exampleAnswers = [];
            } else {
                vm.exampleAnswers.splice(index, vm.exampleAnswers.length);
            }

            vm.chain.forEach(function (question, i) {
                if (index === undefined) {
                    AnswersBuildFunc();
                } else if (index <= i) {
                    AnswersBuildFunc();
                }

                function AnswersBuildFunc() {
                    let tmpAnswer = {answer: 'undefined'};
                    vm.exampleAnswers.push(tmpAnswer);
                }
            });
        }

        let radioId;
        vm.checkRadioTreeExample = function (radio, parentIdentifier, index, manualInput) {
            console.log('radio = ', radio);
            console.log('parentIdentifier = ', parentIdentifier);
            console.log('index = ', index);
            console.log('manualInput = ', manualInput);
            if (manualInput === true) {
                radioId = radio.id;
                let tmpStatus = false;

                // console.log(vm.exampleAnswers);

                for (let chainIndex in vm.chain) {
                    if (vm.chain[chainIndex].type === 1) {
                        if (radioId == vm.exampleAnswers[chainIndex].answer) {
                            // console.log('Already in use');
                            tmpStatus = true;
                            break;
                        }
                    }
                }

                if (tmpStatus === false) {
                    chain(radio.next_question, parentIdentifier);
                    fill(index);
                }
            } else {
                radioId = radio.id;
                chain(radio.next_question, parentIdentifier);
                fill(index);
            }
        };

        let countryGroupId;

        function selectedCountryChange(country, question, index) {

            let questionAnswers = question.answers;
            let parentIdentifier = question.identifier;
            let checkingForAMatch = false;
            let nextQuestion;
            console.log('country = ', country);

            if (country && country.length > 1) {
                let stop = false;
                for (let i = 0; i < questionAnswers.length; i++) {
                    if (!stop) {
                        for (let x = 0; x < questionAnswers[i].answer_text.length; x++) {
                            if (country === questionAnswers[i].answer_text[x]) {
                                console.log('Math! -->', country);
                                stop = true;
                                checkingForAMatch = true;
                                countryGroupId = questionAnswers[i].id;
                                nextQuestion = questionAnswers[i].next_question;
                                break;
                            }
                        }
                    } else {
                        break;
                    }
                }
            }
            if (checkingForAMatch) {
                chain(nextQuestion, parentIdentifier);
                fill(index, true);
            } else {
                chain(question.next_question, parentIdentifier);
                fill(index);
            }
        }

        function changeNextQuest(question, quest, answer) {
            // console.log('question = ', question);
            // console.log('quest = ', quest);
            // console.log('answer = ', answer);

            if (quest === undefined) {
                question.next_question = null;
                vm.data = question;

                if (answer !== undefined) {
                    answer.next_question = null;
                    vm.data = question;
                }
                blockService.addBlockQuestion(idBlock, [vm.data]);

            } else if (question.type === 1) {
                angular.forEach(question.answers, function (ans) {
                    if (answer.id === ans.id) {
                        vm.answerOldValue = answer.next_question;
                        answer.next_question = quest.identifier;
                        vm.data = question;
                    }
                });

                loopingTest(question);

                if (loopingValid === false) {

                } else {
                    blockService.addBlockQuestion(idBlock, [vm.data]);
                }

            } else {
                vm.data = question;
                vm.oldValue = vm.data.next_question;
                vm.data.next_question = quest.identifier;

                loopingTest(question);
                if (loopingValid === false) {
                    console.log('false');
                    console.log(vm.data);
                    return vm.data;
                } else {
                    blockService.addBlockQuestion(idBlock, [vm.data]);
                }
            }


            function loopingTest(Obj) {
                let tmpArr = vm.items;
                let tmpIdentifier = Obj.identifier;
                let chain = [Obj];
                let tmpValid = true;

                for (let i in tmpArr) {
                    for (let index in tmpArr) {
                        if (tmpArr[index].type === 1) {
                            for (let radioIndex in tmpArr[index].answers) {
                                if (tmpArr[index].answers[radioIndex].next_question === tmpIdentifier) {
                                    tmpIdentifier = tmpArr[index].identifier;
                                    chain.push(tmpArr[index]);
                                }
                            }
                        } else {
                            if (tmpArr[index].next_question === tmpIdentifier) {
                                tmpIdentifier = tmpArr[index].identifier;
                                chain.push(tmpArr[index]);
                            }
                        }

                    }
                }

                if (Obj.type === 1) {
                    tmpValid = true;
                    for (let answerIndex in Obj.answers) {
                        for (let chainIndex in chain) {
                            tmpValid = true;
                            if (chain[chainIndex].identifier === Obj.answers[answerIndex].next_question) {
                                tmpValid = false;
                                toastr.error('Warning! You have created a question loop');
                                console.log('You create loop!');
                                Obj.answers[answerIndex].next_question = vm.answerOldValue;
                                break;
                            }
                        }
                        loopingValid = tmpValid;
                    }
                } else {
                    for (let chainIndex in chain) {
                        tmpValid = true;
                        if (chain[chainIndex].identifier === Obj.next_question) {
                            tmpValid = false;
                            vm.tmpValid = tmpValid;
                            toastr.error('Warning! You have created a question loop');
                            console.log('You create loop!');
                            Obj.next_question = vm.oldValue;
                            console.log(Obj);
                            break;
                        }
                    }
                    loopingValid = tmpValid;
                }
            }

            $scope.$emit('changeItems', vm.items);
        }

        function mandatoryChecked(question) {
            return question.mandatory;
        }

        function mandatoryCheck(saveTodo) {
            angular.forEach(vm.items, function (question) {
                if (saveTodo.id === question.id) {
                    if (question.mandatory) {
                        question.mandatory = false;
                    } else {
                        question.mandatory = true;
                    }
                    vm.data = question;
                    blockService.updateQuestion(vm.data.id, vm.data).then(function (res) {
                    });
                }

            });
        }

        function copyQuest(question, answer) {

            if (answer === undefined) {
                vm.data = angular.copy(question);
                vm.data.id = undefined;

                let text = "";
                let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (let i = 0; i < 5; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }

                vm.data.identifier = vm.data.identifier + '-' + text;

                blockService.addBlockQuestion(idBlock, [vm.data]).then(function (res) {
                    if (res.success) {
                        vm.items.splice(vm.items.indexOf(question) + 1, 0, res.data.questions[0]);
                        toastr.success('Question was duplication')
                    }
                });
            } else {
                vm.data = angular.copy(question);

                let copyAnswer = angular.copy(answer);
                copyAnswer.id = undefined;
                vm.data.answers.push(copyAnswer);
                blockService.addBlockQuestion(idBlock, [vm.data]).then(function (res) {
                    if (res.success) {
                        vm.items.splice(vm.items.indexOf(question), 1, res.data.questions[0]);
                        toastr.success('Answer was duplication')
                    }
                });
            }

        }

        function checkKey(data) {
            blockService.addBlockQuestion(idBlock, [data]).then(function (res) {
                if (res.success) {
                    vm.items.splice(vm.items.indexOf(data), 1, res.data.questions[0]);
                }
            });
        }


    }
})();