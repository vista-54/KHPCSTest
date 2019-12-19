;(function () {
    angular
        .module('factory.company', [])
        .factory('company', company);

    company.$inject = ['$localStorage', '$sessionStorage', 'companyService'];

    function company($localStorage, $sessionStorage, companyService) {
        let model = {};
        model.setActiveCompany = setActiveCompany;
        model.getActiveCompany = getActiveCompany;

        return model;

        function setActiveCompany(id, indexCompany) {
            delete $sessionStorage['company_id'];
            delete $sessionStorage['active_company_index'];
            $sessionStorage['active_company_id'] = id;
            $sessionStorage['active_company_index'] = indexCompany;
        }
        function getActiveCompany() {
            let tmpObj = {
                id: $sessionStorage['active_company_id'],
                indexCompany: $sessionStorage['active_company_index']
            };
            return  tmpObj;
        }


    }

})();