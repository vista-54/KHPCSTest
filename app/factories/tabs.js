;(function () {
    angular
        .module('factory.tabs', [])
        .factory('tabs', tabs);

    tabs.$inject = ['$localStorage', '$sessionStorage' , 'userService'];

    function tabs($localStorage, $sessionStorage , userService) {
        let model = {};
        model.clearAfterLogout = clearAfterLogout;
        model.getRole = getRole;

        return model;

        function getRole() {
            let vm = this;
            let user = userService.getUser();
            vm.role = user.role_id;
            switch (vm.role) {
                case 1:
                    vm.role = 'Financial Advisor';
                    break;
                case 2:
                    vm.role = 'Super Admin';
                    break;
                case 3:
                    vm.role = 'Company Admin';
                    break;
            }
            return vm.role;
        }

        function clearAfterLogout() {
            $localStorage.$reset();
            $sessionStorage.$reset();
        }

    }
})();