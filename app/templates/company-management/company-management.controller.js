;(function () {
    'use strict';
    angular.module('app')
        .controller('CompanyManagementController', CompanyManagementController);

    CompanyManagementController.$inject = ['companyService', 'company', '$mdDialog', 'toastr', 'tabsService', '$scope'];

    function CompanyManagementController(companyService, company, $mdDialog, toastr, tabsService, $scope) {
        let vm = this;
        tabsService.startTab();
        $scope.$emit('changeTab', 'page2');


        vm.createCompany = createCompany;
        vm.deleteCompany = deleteCompany;
        vm.setActiveCompany = setActiveCompany;

        vm.company = companyService.getCompany().companies;

        function setActiveCompany(id, indexCompany) {
            company.setActiveCompany(id, indexCompany);
        }

        function createCompany(id, company) {
            $mdDialog.show({
                controller: 'AddCompanyController',
                controllerAs: 'vm',
                templateUrl: 'components/company-management/add-company/add-company.html',
                clickOutsideToClose: true,
                locals: {
                    data: {
                        id: id,
                        company: company
                    }

                }
            }).then(function (res) {
                if (res.type === 'create') {
                    vm.company.unshift(res.data.company);
                    toastr.success('Company was created');
                } else {
                    vm.company.splice(vm.company.indexOf(company), 1, res.data.company);
                    toastr.success('Edit was success');
                }
            }, function () {

            });
        }

        function deleteCompany(id, company) {
            $mdDialog.show({
                controller: 'DeleteViewController',
                controllerAs: 'vm',
                templateUrl: 'components/delete-view/delete-view.html',
                clickOutsideToClose: true
            }).then(function () {
                companyService.companyDel(id).then(function (res) {
                    if (res.success) {
                        vm.company.splice(vm.company.indexOf(company), 1);
                        toastr.success('Company was deleted');
                    } else {
                        console.log('error')
                    }
                });
            }, function () {

            })
        }
    }
}());