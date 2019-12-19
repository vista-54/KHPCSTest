;(function () {
    angular
        .module('factory.customers', [])
        .factory('customers', customers);


    customers.$inject = ['$localStorage', '$sessionStorage'];

    function customers($localStorage, $sessionStorage) {
        let model = {};

        model.setActiveCustomers = setActiveCustomers;
        model.getActiveCustomers = getActiveCustomers;

        model.setfinishQuestionair = setfinishQuestionair;
        model.getfinishQuestionair = getfinishQuestionair;

        return model;


        function setActiveCustomers(id) {
            delete $sessionStorage['active_customers'];
            $sessionStorage['active_customers'] = id;
        }

        function getActiveCustomers() {
            return $sessionStorage['active_customers'];
        }

        function setfinishQuestionair(data) {
            delete $sessionStorage['finish_questionaire'];
            $sessionStorage['finish_questionaire'] = data;
        }

        function getfinishQuestionair() {
            return $sessionStorage['finish_questionaire'];
        }


    }

})();