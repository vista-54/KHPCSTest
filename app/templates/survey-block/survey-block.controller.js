;(function () {
    'use strict';
    angular.module('app')
        .controller('SurveyBlockController', SurveyBlockController);

    SurveyBlockController.$inject = ['blockService', '$state', 'survey', '$scope', '$mdDialog' , 'toastr', 'items', 'tabsService', '$timeout', '$mdSidenav', '$sessionStorage'];

    function SurveyBlockController(blockService, $state, survey, $scope, $mdDialog , toastr, items, tabsService, $timeout, $mdSidenav, $sessionStorage) {
        let vm = this;
        tabsService.startTab();
        $scope.$emit('changeTab', 'page3');

        let activeSurvey = survey.getActiveSurvey();
        vm.activeBlock = survey.getActiveBlock().indexBlock;

        let idSurvey = activeSurvey.id;

        vm.items = items;

        vm.addBlock = addBlock;
        vm.setActiveBlock = setActiveBlock;
        vm.deleteBlock = deleteBlock;

        function setActiveBlock(id, indexBlock) {
            vm.activeBlock = indexBlock;
            survey.setActiveBlock(id, indexBlock);
            let tmpObj = {
                activeBlock: {
                    id: id,
                    indexBlock: indexBlock
                }
            };
            $scope.$broadcast('setItems', items);
            $scope.$broadcast('setActiveBlock', tmpObj);
            $state.go('tab.survey-block.survey-question');
        }

        $scope.$on('showBlock', function (event, data) {
            buildToggler();
        });

        function buildToggler() {
            $mdSidenav('left').toggle();
        }

        $scope.$on('changeItems', function (event, data) {
            vm.items[vm.activeBlock].questions = data;
        });

        if (vm.items.length > 0) {
            if(vm.activeBlock == undefined){
                setActiveBlock(vm.items[0].id, 0);
            }
            $state.go('tab.survey-block.survey-question');
        }
        else {
            console.log('no data');
        }

        vm.sortableOptionsBlock = {
            connectWith: ".block-container",
            "ui-floating": true,

            stop: function (event, ui) {
                let droptargetModel = ui.item.sortable.droptargetModel;
                let model = ui.item.sortable.model;

                if(droptargetModel == vm.items) {
                    let mainTmpObj = [];
                    vm.items.forEach(function (item, index) {
                        let tmpObj = {
                            id: item.id,
                            order_number: index
                        };
                        mainTmpObj.push(tmpObj);
                    });

                    blockService.orderUpdate(idSurvey, mainTmpObj);

                    for(let i = 0; i < droptargetModel.length; i++){
                        if(model.id == droptargetModel[i].id){
                            setActiveBlock(model.id, i);
                            break;
                        }
                    }
                }
            }
        };

        function addBlock(item, index) {

            let orderNumber = 0;
            vm.items.forEach(function (item) {
                if(item.order_number > orderNumber) {
                    orderNumber = item.order_number;
                }
            });

            $mdDialog.show({
                controller: 'AddBlockController',
                controllerAs: 'vm',
                templateUrl: 'components/survey-block/add-block/add-block.html',
                clickOutsideToClose: true,
                locals: {
                    data: {
                        item: item,
                        idSurvey: idSurvey,
                        order_number: orderNumber + 1
                    }
                }
            }).then(function (res) {
                if (res.type) {
                    vm.items.splice(index, 1, res.data.block);
                    items.splice(index, 1, res.data.block);

                    let nameBlock = res.data.block.name;
                    $scope.$broadcast('setBlockName', nameBlock);

                    toastr.success('Block was edited');
                }
                else {
                    items.push(res.data.block);
                    vm.items = items;

                    let indexBlock = vm.items.length - 1;
                    let id = res.data.block.id;

                    setActiveBlock(id, indexBlock);
                    $scope.$broadcast('setItems', items);
                    toastr.success('New block was created');
                }
            }, function () {

            });
        }

        function deleteBlock(id, index) {
            $mdDialog.show({
                controller: 'DeleteViewController',
                controllerAs: 'vm',
                templateUrl: 'components/delete-view/delete-view.html',
                clickOutsideToClose: true
            }).then(function () {
                blockService.deleteBlock(id).then(function (res) {
                    if (res.success) {
                        if (vm.items.length === 1) {
                            vm.items = [];
                            items = [];
                            $scope.$broadcast('setItems', items);
                            vm.activeBlock = undefined;
                            delete $sessionStorage.active_block_id;
                            delete $sessionStorage.active_block_index;
                            $state.go('tab.survey-block');
                        } else {
                            vm.items.splice(index, 1);
                            // items.splice(index, 1);
                            $scope.$broadcast('setItems', items);
                            let indexBlock = survey.getActiveBlock().indexBlock;
                            if(indexBlock == index) {
                                let id = vm.items[0].id;
                                setActiveBlock(id, 0);
                            }
                            toastr.success('Block was deleted');
                        }
                    }
                });
            }, function () {

            });
        }
    }
})();