;(function () {
    angular.module('app',
        [
            'app.core',
            'blocks.directives',
            'blocks.request',
            'blocks.services',
            'blocks.filters',

        ])
        .run(runBlock);

    runBlock.$inject = ['$localStorage', '$state'];

    function runBlock($localStorage, $state) {
        if(!$localStorage.token) {
            $state.go('login');
        }
    }
})();