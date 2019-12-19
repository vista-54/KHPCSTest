;(function () {
    'use strict';

    angular
        .module('service.companyService', [])
        .service('companyService', companyService);

    companyService.$inject = ['http', 'url' , '$sessionStorage' ];

    function companyService(http, url , $sessionStorage) {
        let model = {};

        model.inviteAdm = inviteAdm;
        model.companyCreate = companyCreate;
        model.loadCompany = loadCompany;
        model.getCompany = getCompany;
        model.getCompany = getCompany;
        model.companyDel = companyDel;
        model.companyEdit = companyEdit;
        model.loadOneCompany = loadOneCompany;
        model.allCompanies = allCompanies;
        model.assign = assign;
        model.companyAdmin = companyAdmin;
        model.deleteAdmin = deleteAdmin;
        model.cancelInv = cancelInv;
        model.companyCustomers = companyCustomers;
        model.changeFA = changeFA;
        model.selectedSurvTempInCompany = selectedSurvTempInCompany;
        model.reSend = reSend;

        return model;

        function inviteAdm (data) {
            return http.post(url.user.inviteAdm, data);
        }

        function reSend(data) {
            return http.post(url.user.reSend, data);
        }

        function cancelInv(id) {
            return http.delete(url.company_func(id).cancelInv);
        }

        function deleteAdmin(id) {
            return http.delete(url.company_func(id).deleteAdm );
        }

        function changeFA(data) {
            return http.put(url.company.changeFA , data);
        }

        function companyCreate(data) {
            return http.post(url.company.createCompany, data);
        }

        function companyDel(id) {
            return http.delete(url.company_func(id).company );
        }

        function companyEdit(id , data) {
            return http.put(url.company_func(id).company , data);
        }

        function loadCompany() {
            return http.get(url.company.company, {}).then(function (res) {
                if(res.success){
                    setCompany(res.data);
                    return res;
                }
            });
        }

        function setCompany(data) {
            delete $sessionStorage['company_only'];
            $sessionStorage['company_only'] = data;
        }
        function getCompany() {
            return $sessionStorage['company_only'];
        }

        function allCompanies(){
            return http.get(url.company.company);
        }

        function loadOneCompany(id) {
            return http.get(url.company_func(id).company );
        }

        function assign(id , data) {
            return http.post(url.company_func(id).assign , data);
        }

        function companyAdmin() {
            return http.get(url.company.companyAdmin);
        }

        function companyCustomers(id) {
            return http.get(url.company_func(id).companyCustomers);
        }

        function selectedSurvTempInCompany(id) {
            return http.get(url.company_func(id).selectedSurvTempInCompany );
        }

    }
})();