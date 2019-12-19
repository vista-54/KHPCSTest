;(function () {
    'use strict';
    angular.module('app')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['userService', 'toastr', 'tabsService', '$scope', 'tabs'];

    function ProfileController(userService, toastr, tabsService, $scope, tabs) {
        let vm = this;
        tabsService.startTab();
        $scope.$emit('changeTab', 'page5');

        vm.updateProfileInfo = updateProfileInfo;
        vm.menu = menu();
        vm.user = userService.getUser();
        vm.role = tabs.getRole();
        vm.goBack = goBack;

        let user = vm.user;

        if (typeof vm.user.id !== 'undefined') {
            vm.dataInfo = {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }

        let id = vm.dataInfo.id;

        function updateProfileInfo() {
            if (vm.profile.$invalid) {
                return;
            } else {
                userService.updateInfo(id, vm.dataInfo).then(function (res) {
                    if (res.success) {
                        userService.loadUser().then(function () {
                            userService.loadItems().then(function () {
                            })
                        });

                        if (!vm.show) {
                            toastr.success('Profile was updated');
                            window.history.back();
                        }

                    } else {
                        toastr.error('This email is already taken ');
                    }
                });

                if (vm.show === true) {
                    if (vm.profilePass.$invalid || vm.data.password !== vm.data.password_confirmation) {
                        return;
                    } else {
                        userService.updatePass(id, vm.data).then(function (res) {
                            if (res.success) {
                                userService.loadUser().then(function () {
                                    userService.loadItems().then(function () {
                                    })
                                });

                                toastr.success('Profile was updated');
                                window.history.back();
                            } else {
                                console.log('error');
                                toastr.error('Current password is incorrect');
                            }
                        })
                    }
                }
            }
        }

        function menu() {
            let show = [{}];
            return {
                change: change,
                isShow: isShow
            };

            function change(data) {
                show[data] = !show[data];
                vm.show = show[data];
            }

            function isShow(data) {
                return show[data]
            }
        }

        function goBack() {
            window.history.back();
        }

    }
}());