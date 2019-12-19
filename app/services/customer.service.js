;(function () {
    'use strict';

    angular
        .module('service.customerService', [])
        .service('customerService', customerService);

    customerService.$inject = ['http', 'url', '$sessionStorage'];

    function customerService(http, url, $sessionStorage) {
        let model = {};

        //User management
        model.loadCustomers = loadCustomers;
        model.getCustomers = getCustomers;
        model.createCustomers = createCustomers;
        model.updateCustomers = updateCustomers;
        model.deleteCustomers = deleteCustomers;

        return model;

        //User management
        function loadCustomers() {
            return http.get(url.customers.customers, {}).then(function (res) {
                if (res.success) {
                    setCustomers(res.data);
                } else {
                    //need to show error msg
                }
            });
        }
        function getCustomers() {
            return $sessionStorage['customers_index'];
        }
        function setCustomers(items) {
            delete $sessionStorage['customers_index'];
            $sessionStorage['customers_index'] = items;
        }


        function createCustomers(data) {
            return http.post(url.customers.customers, data);
        }
        function updateCustomers(id, data) {
            return http.put(url.customers_func(id).updateCustomers, data);
        }
        function deleteCustomers(id) {
            return http.delete(url.customers_func(id).updateCustomers, {});
        }
    }
})();