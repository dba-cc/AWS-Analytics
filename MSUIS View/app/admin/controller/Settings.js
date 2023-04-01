﻿app.controller('SettingsCtrl', function ($scope, $http, $rootScope, NgTableParams) {
    $rootScope.pageTitle = "Settings";
    $scope.all = true;
   
    $scope.initfun = function () {
        $scope.getTrigStatus();
        $scope.getlocr("rloc");
        $scope.getlocd("dloc");        
    }

    $scope.toggleDefaultLocations = function () {
        $('#options').slideToggle()
    }

    $scope.checkIt = function () {
        if (!$scope.check) {
            $scope.check = true;
            $('#freq').fadeIn();
            $scope.setTrigToggle(1);
        } else {
            $scope.check = false;
            $scope.setTrigToggle(0);
        }
        console.log($scope.check)
    }
    $scope.checkIt_table = function () {
        if (!$scope.check_table) {
            $scope.check_table = true;
            $('#freq').fadeIn();
           
        } else {
            $scope.check_table = false;
           
        }
        console.log($scope.check_table)
    }

    $scope.getTrigStatus = function () {
        showLoadingScreen();

        $http({
            method: 'POST',
            url: 'api/Settings/trigger_status',
            headers: { "Content-Type": 'application/json' }
        })

            .success(function (response) {
                if (response.response_code == "201") {
                    $scope.TrigStatus = {};
                }
                else {
                    $scope.TrigStatus = new NgTableParams({
                        count: response.obj.length
                    }, {
                        dataset: response.obj
                    });
                    $scope.check = response.obj;
                    console.log(response.obj);
                }
                hideLoadingScreen();
            })
            .error(function (res) {
                $rootScope.$broadcast('dialog', "Error", "alert", res.obj);
                hideLoadingScreen();
               
            });
    };

    $scope.setTrigToggle = function (d) {
        showLoadingScreen();

        $http({
            method: 'POST',
            url: 'api/Settings/trigger_toggle',
            data: d,
            headers: { "Content-Type": 'application/json' }
        })

            .success(function (response) {
                if (response.response_code == "201") {
                    $scope.TrigToggle = {};
                }
                else {
                    $scope.TrigToggle = new NgTableParams({
                        count: response.obj.length
                    }, {
                        dataset: response.obj
                    });

                    //console.log(response.obj);
                }
                hideLoadingScreen();
            })
            .error(function (res) {
                $rootScope.$broadcast('dialog', "Error", "alert", res.obj);
                hideLoadingScreen();
            });
    };

    $scope.getlocr = function (data) {

        $http({
            method: 'POST',
            url: 'api/Settings/default_loc',
            data: {
                "typ": data
            },
            headers: { "Content-Type": 'application/json' }
        })

            .success(function (response) {
                if (response.response_code == "201") {
                    $scope.rloc = {};
                }
                else {
                    $scope.rloc = new NgTableParams({
                        count: response.obj.length
                    }, {
                        dataset: response.obj
                    });
                    //$scope.somevalue_r = response.obj;
                    document.getElementById('rloc').value = response.obj;
                    //console.log(response.obj);
                }
            })
            .error(function (res) {
                $rootScope.$broadcast('dialog', "Error", "alert", res.obj);
                hideLoadingScreen();
            });
    };
    $scope.getlocd = function (data) {

        $http({
            method: 'POST',
            url: 'api/Settings/default_loc',
            data: {
                "typ": data
            },
            headers: { "Content-Type": 'application/json' }
        })

            .success(function (response) {
                if (response.response_code == "201") {
                    $scope.rloc = {};
                }
                else {
                    $scope.rloc = new NgTableParams({
                        count: response.obj.length
                    }, {
                        dataset: response.obj
                    });
                    //$scope.somevalue_r = response.obj;
                    document.getElementById('dloc').value = response.obj;
                    //console.log(response.obj);
                }
            })
            .error(function (res) {
                $rootScope.$broadcast('dialog', "Error", "alert", res.obj);
                hideLoadingScreen();
            });
    };
    $scope.submit = function () {
        var r = document.getElementById('rloc').value;
        var d = document.getElementById('dloc').value;
        $scope.updateloc(r, 'rloc')
        $scope.updateloc(d, 'dloc')
        console.log(r);
        console.log(d);
    }
    $scope.updateloc = function (loc,type) {
        console.log(loc)
        console.log(type)
        $http({
            method: 'POST',
            url: 'api/Settings/update_loc',
            data: {
                "loc": loc,
                "typ": type
            },
            headers: { "Content-Type": 'application/json' }
            
        })

            .success(function (response) {
                if (response.response_code == "201") {
                    showMessage(response.obj);
                }
                else {
                    showMessage(response.obj);
                }
            })
            .error(function (res) {
                $rootScope.$broadcast('dialog', "Error", "alert", res.obj);
                hideLoadingScreen();
            });
    };


});