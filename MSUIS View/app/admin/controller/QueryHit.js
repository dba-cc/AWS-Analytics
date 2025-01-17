app.controller('QueryHitCtrl', function ($scope, $interval, $http, NgTableParams, $timeout) {
    $scope.QueryHitParams = new NgTableParams({}, {});

    $scope.filterType = 'rel';
    $scope.eventype = 'adhoc';
    $scope.timeFormat = 'Minute'
    $scope.time = '1'
    $scope.db = 'Query'
    $scope.chartfactor = 'Time'
    $scope.tabletype = 'dmv'
    $scope.autorefresh = 'true'

    var executionCount = [];
    var lastElapsedTime = [];
    var lastWorkerTime = [];
    var sr_no = [];
    $scope.o = false;

    $scope.checkmainfn = function () {
        if (!$scope.checkmn) {
            $scope.checkmn = true;
            $scope.autorefresh = 'false'
            $('#autofreq').fadeOut();
            $scope.refresh = 'eventype'
            document.getElementById('event').style.display = 'block'
            document.getElementById('eventype').style.display = 'block'
            document.getElementById('dmv').style.display = 'none'
            document.getElementById('dmvtype').style.display = 'none'
            
        } else {
            $scope.checkmn = false;            
            $scope.autorefresh = 'true'
            $('#autofreq').fadeIn();   
            $scope.refresh = 'dmvtype'
            document.getElementById('dmv').style.display = 'block'
            document.getElementById('dmvtype').style.display = 'block'
            document.getElementById('eventype').style.display = 'none'
            document.getElementById('event').style.display = 'none'
        }
    }
    
    $scope.checkIt = function () {
        if (!$scope.check) {
            $scope.check = true;
            $('#freq').fadeIn();
            $scope.o = true;
        } else {
            $scope.check = false;
            $('#freq').fadeOut();
            $scope.o = false;
            $interval.cancel($scope.p);
            $interval.cancel($scope.c);
            document.getElementById('placeholder').innerText = 'Auto Refresh Freq'
            document.getElementById('freq').value = "";
        }
    }

    $scope.refreq = function () {
        $interval.cancel($scope.c);
        $interval.cancel($scope.p);
        //clearInterval($scope.p);
        // $scope.temp;        
        if ($scope.o == true) { // check if auto refresh is on or off
            $scope.tep($scope.temp);
            $scope.p = $interval(function () {
                $interval.cancel($scope.c);
                console.log($scope.temp)                
                $scope.tep($scope.temp)
                $scope.FetchQueryHitList();
                $scope.filterQueries();
            }, $scope.temp);
        }
    }

    $scope.tep = function (b) {
        var a = (b / 1000);
        /* var minutes = Math.floor(a / 60);
         var seconds = a % 60; 
         console.log( minutes +' : '+ seconds )*/
        $scope.c = $interval(function () {
            document.getElementById('placeholder').innerText = ' ' + --a + ' sec';
            /* document.getElementById('placeholder').innerText = ' ' + minutes + ' : ' + --seconds + ' sec';*/
        }, 1000);
    }

    $scope.dropdown = function () {
        $('.ui.dropdown').dropdown();
    }

    $scope.changeFormat = function () {
        document.getElementById('timeInput').placeholder = 'Number of ' + $scope.timeFormat + 's'
        document.getElementById('timeInputDiv').style.display = 'flex'
    }

    $scope.$watch("QueryHitParams.filter()", function (newFilter) {
        $timeout(function () {
            var filteredData = $scope.QueryHitParams.data;
            $scope.generateChart(filteredData)
        });
    }, true);

    $scope.copyQuery = function (query) {
        if (query == null) {
            queryElement = document.getElementById('selectedQueryText');
            queryElement.select();
            navigator.clipboard.writeText(queryElement.value);
        } else {
            navigator.clipboard.writeText(query);
        }
        showMessage('Query copied in clipboard.')
    }

    $scope.FetchQueryHitListWithAbs = function () {
        showLoadingScreen();

        $scope.db = document.getElementById('dbname').value;
        if (document.getElementById('dbname').value == '? undefined:undefined ?') {
            $scope.db = 'Query';
            document.getElementById('dbname').value = $scope.db;
            $scope.dropdown();
        }

        var pageNum = 1;
        var totalData = [];
        function fetchPage(pageNum) {
            $http({
                method: 'POST',
                url: 'api/Analytics/GetQueryHitWithAbsRange',
                data: '"' + document.getElementById('fromDate').value + ' ' + document.getElementById('toDate').value + ' ' + $scope.db + ' ' + pageNum + '"',
                headers: { "Content-Type": 'application/json' }
            })
                .success(function (response) {
                    if (response.response_code != "200") {

                        showMessage(response.obj);

                    }
                    else {

                        totalData = totalData.concat(response.obj.data);
                        if (response.obj.data.length > 0) {

                            setTimeout(function () {
                                fetchPage(pageNum + 1);
                            }, 0)

                        } else {
                            $scope.QueryHitParams = new NgTableParams({
                                count: totalData.length
                            }, {
                                dataset: totalData,

                            });
                            $scope.generateChart(totalData);
                            hideLoadingScreen();

                        }
                    }

                })
                .error(function (res) {
                    showMessage(res.obj);
                    hideLoadingScreen();
                });
        }

        fetchPage(pageNum);
    };
    $scope.FetchAdhoc = function () {
        showLoadingScreen();

        var pageNum = 1;
        var totalData = [];
        function fetchPage(pageNum) {
            $http({
                method: 'POST',
                url: 'api/Analytics/GetEventAdhocWithAbsRange',
                data: '"' + document.getElementById('fromDateadhoc').value + ',' + document.getElementById('toDateadhoc').value + ',' + pageNum + '"',
                headers: { "Content-Type": 'application/json' }
            })
                .success(function (response) {
                    if (response.response_code != "200") {

                        showMessage(response.obj);

                    }
                    else {

                        totalData = totalData.concat(response.obj.data);
                        if (response.obj.data.length > 0) {

                            setTimeout(function () {
                                fetchPage(pageNum + 1);
                            }, 0)

                        } else {
                            $scope.AdhocParams = new NgTableParams({
                                count: totalData.length
                            }, {
                                dataset: totalData,

                            });
                            $scope.EventGraph(totalData);
                            hideLoadingScreen();    
                            $scope.hideeventsPopup();
                        }
                    }

                })
                .error(function (res) {
                    showMessage(res.obj);
                    hideLoadingScreen();
                });
        }
        fetchPage(pageNum);
    };
    $scope.FetchSP = function () {
        
        showLoadingScreen();

        $scope.db = document.getElementById('dbname').value;
        if (document.getElementById('dbname').value == '? undefined:undefined ?') {
            $scope.db = 'Query';
            document.getElementById('dbname').value = $scope.db;
            $scope.dropdown();
        }

        var pageNum = 1;
        var totalData = [];
        function fetchPage(pageNum) {
            $http({
                method: 'POST',
                url: 'api/Analytics/GetEventSPWithAbsRange',
                data: '"' + document.getElementById('fromDatesp').value + ',' + document.getElementById('toDatesp').value + ',' + $scope.db + ',' + pageNum + '"',
                headers: { "Content-Type": 'application/json' }
            })
                .success(function (response) {
                    if (response.response_code != "200") {

                        showMessage(response.obj);

                    }
                    else {

                        totalData = totalData.concat(response.obj.data);
                        if (response.obj.data.length > 0) {

                            setTimeout(function () {
                                fetchPage(pageNum + 1);
                            }, 0)

                        } else {
                            $scope.SpParams = new NgTableParams({
                                count: totalData.length
                            }, {
                                dataset: totalData,

                            });
                            $scope.EventGraph(totalData);
                            hideLoadingScreen();
                            $scope.hideeventsPopup();

                        }
                    }

                })
                .error(function (res) {
                    showMessage(res.obj);
                    hideLoadingScreen();
                });
        }

        fetchPage(pageNum);
    };

  $scope.FetchQueryHitList = function () {
        showLoadingScreen();
        $scope.changeView('half', null)
        $scope.db = document.getElementById('dbname').value;
        if (document.getElementById('dbname').value == '? undefined:undefined ?') {
            $scope.db = 'Query';
            document.getElementById('dbname').value = $scope.db;
            $scope.dropdown();
        }

        var pageNum = 1;
        var totalData = [];
        function fetchPage(pageNum) {
            $http({
                method: 'POST',
                url: 'api/Analytics/GetQueryHit',
                data: '"' + $scope.timeFormat + ' ' + $scope.time + ' ' + $scope.db + ' ' + pageNum + '"',
                headers: { "Content-Type": 'application/json' }
            })
                .success(function (response) {
                    if (response.response_code != "200") {

                        showMessage(response.obj);

                    }

                    else {
                        console.log(response.obj)
                        totalData = totalData.concat(response.obj.data);
                        if (response.obj.data.length > 0) {

                            setTimeout(function () {
                                fetchPage(pageNum + 1);
                            }, 0)

                        } else {
                            $scope.QueryHitParams = new NgTableParams({
                                count: totalData.length
                            }, {
                                dataset: totalData,

                            });
                            $scope.generateChart(totalData);
                            hideLoadingScreen();

                        }
                    }

                })
                .error(function (res) {
                    showMessage(res.obj);
                    hideLoadingScreen();
                });
        }

        fetchPage(pageNum);
  }

    $scope.GetEarliestQueryDate = function () {
        $http({
            method: 'POST',
            url: 'api/Analytics/GetEarliestDate',
            headers: { "Content-Type": 'application/json' }
        })

            .success(function (response) {
                if (response.obj == 'There is no row at position 0.') {
                    $scope.earliestDate = '';
                } else {
                    $scope.earliestDate = response.obj;
                    document.getElementById('fromDate').min = $scope.earliestDate;
                    document.getElementById('toDate').min = $scope.earliestDate;
                }
            })
            .error(function (res) {
                alert('dialog', "Error", "alert", res.obj);
                hideLoadingScreen();
            });
    };
    $scope.GetEarliestAdhocDate = function () {
        $http({
            method: 'POST',
            url: 'api/Analytics/GetEarliestAdhocDate',
            headers: { "Content-Type": 'application/json' }
        })

            .success(function (response) {
                if (response.obj == 'There is no row at position 0.') {
                    $scope.earliestadhocDate = '';
                } else {
                    $scope.earliestadhocDate = response.obj;
                    document.getElementById('fromDateadhoc').min = $scope.earliestadhocDate;
                    document.getElementById('toDateadhoc').min = $scope.earliestadhocDate;
                }
            })
            .error(function (res) {
                alert('dialog', "Error", "alert", res.obj);
                hideLoadingScreen();
            });
    };
    $scope.GetEarliestSPDate = function () {
        $http({
            method: 'POST',
            url: 'api/Analytics/GetEarliestSPDate',
            headers: { "Content-Type": 'application/json' }
        })

            .success(function (response) {
                if (response.obj == 'There is no row at position 0.') {
                    $scope.earliestspDate = '';
                } else {
                    $scope.earliestspDate = response.obj;
                    document.getElementById('fromDatesp').min = $scope.earliestspDate;
                    document.getElementById('toDatesp').min = $scope.earliestspDate;
                }
            })
            .error(function (res) {
                alert('dialog', "Error", "alert", res.obj);
                hideLoadingScreen();
            });
    };

    $scope.getDatabaseList = function () {

        $http({
            method: 'POST',
            url: 'api/Database/GetDatabase',
            headers: { "Content-Type": 'application/json' }
        })

            .success(function (response) {
                if (response.response_code == "201") {
                    $scope.DatabaseList = {};
                }
                else {
                    $scope.DatabaseList = response.obj;
                }
            })
            .error(function (res) {
                $rootScope.$broadcast('dialog', "Error", "alert", res.obj);
                hideLoadingScreen();
            });
    };
    $scope.activator = null;

    $scope.toggleCheckbox = function (data, e) {
        if ($scope.activator != null) {
            $scope.activator.classList.remove('activerow');
            $scope.activator = null;
            $scope.generateChart(null);
            $scope.changeFactor();
            $('#factor-div').fadeIn();
            document.getElementById('selectedQueryText').value = '';
            document.getElementById('selectedQueryTextDiv').style.display = 'none';
            return;
        }
        $scope.activator = e.currentTarget.parentNode.parentNode;
        e.currentTarget.parentNode.parentNode.classList.add('activerow');
        $('#factor-div').fadeOut();
        document.getElementById('selectedQueryText').value = data.query;
        document.getElementById('selectedQueryTextDiv').style.display = 'flex';
        $scope.qhgraph(data);
        //console.log(data.query)
    }
    $scope.EventGraph = function (data) {
        if ($scope.activator != null) {
            $scope.generateeventChart(null);
            $scope.changeFactor();
            $('#factor-div').fadeIn();
            return;
        }
        $('#factor-div').fadeOut();
        $scope.generateeventChart(data);
        //console.log(data.query)
    }

    $scope.qhgraph = function (data) {
        showLoadingScreen();
        $http({
            method: 'POST',
            url: 'api/Analytics/GetQHGraph',
            data: '"' + data.ctime + ',' + data.dbname + '"',
            headers: { "Content-Type": 'application/json' }
        })

            .success(function (response) {
                if (response.response_code == "201") {
                    $scope.DatabaseList = {};
                }
                else {
                    $scope.generateQueryChart(response.obj)

                }
                hideLoadingScreen();
            })
            .error(function (res) {
                $rootScope.$broadcast('dialog', "Error", "alert", res.obj);
                hideLoadingScreen();
            });
    }

    $scope.generateQueryChart = function (data) {
        var datetime = data.map(function (obj) {
            return obj.time.trim();
        });
        var execution_count = data.map(function (obj) {
            return obj.execution_count;
        });

        const chartCanvas = document.getElementById('analytics-chart');
        if (typeof $scope.chart !== 'undefined') {
            $scope.chart.destroy();
        }
        $scope.chart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: datetime,
                datasets: [{
                    label: ' Execution Count',
                    data: execution_count,
                    borderWidth: 3,
                    backgroundColor: '#27bc1a3b',
                    borderColor: '#20bb40ad',
                    fill: true
                }]
            },
            options: {
                maintainAspectRatio: false,
                cutoutPercentage: 50,
                responsive: true,
                plugins: {
                    filler: {
                        propagate: false,
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                        },
                    },
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            drag: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        }
                    }
                },
                interaction: {
                    intersect: false,
                },
            }
        });

    }

    $scope.generateChart = function (data) {
        
        if (data != null) {
            var sr_no_count = 1;
            sr_no = data.map(function (obj) {
                return sr_no_count++;
            });
            lastWorkerTime = data.map(function (obj) {
                return obj.last_worker_time;
            });
            lastElapsedTime = data.map(function (obj) {
                return obj.last_elapsed_time;
            });
            executionCount = data.map(function (obj) {
                return obj.execution_count;
            });
        }
        
        const chartCanvas = document.getElementById('analytics-chart');
        if (typeof $scope.chart !== 'undefined') {
            $scope.chart.destroy();
        }

        $scope.chart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: sr_no,
                datasets: [{
                    label: ' Last Worker Time (ms)',
                    data: lastWorkerTime,
                    borderWidth: 3,
                    backgroundColor: '#27bc1a3b',
                    borderColor: '#20bb40ad',
                    fill: true
                }, {
                    label: ' Last Elapsed Time (ms)',
                    data: lastElapsedTime,
                    borderWidth: 3,
                    backgroundColor: '#2185D03B',
                    borderColor: '#2185D0AD',
                    fill: true
                }]
            },
            options: {
                maintainAspectRatio: false,
                cutoutPercentage: 50,
                responsive: true,
                scales: {
                    y: {
                        ticks: {
                            stepSize: 500,
                        }
                    }
                },
                plugins: {
                    filler: {
                        propagate: false,
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                        },
                    },
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            drag: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        }
                    }
                },
                interaction: {
                    intersect: false,
                },
            }
        });
    }
    $scope.generateeventChart = function (data) {
        
        if (data != null) {
            var sr_no_count = 1;
            sr_no = data.map(function (obj) {
                return sr_no_count++;
            });
            Duration = data.map(function (obj) {
                return obj.Duration;
            });
            CpuTime = data.map(function (obj) {
                return obj.CpuTime;
            });
        }
        
        const chartCanvas = document.getElementById('analytics-chart');
        if (typeof $scope.chart !== 'undefined') {
            $scope.chart.destroy();
        }

        $scope.chart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: sr_no,
                datasets: [{
                    label: ' Duration (ms)',
                    data: Duration,
                    borderWidth: 3,
                    backgroundColor: '#27bc1a3b',
                    borderColor: '#20bb40ad',
                    fill: true
                }, {
                    label: ' Cpu Time (ms)',
                    data: CpuTime,
                    borderWidth: 3,
                    backgroundColor: '#2185D03B',
                    borderColor: '#2185D0AD',
                    fill: true
                }]
            },
            options: {
                maintainAspectRatio: false,
                cutoutPercentage: 50,
                responsive: true,
               /* scales: {
                    y: {
                        ticks: {
                            stepSize: 500,
                        }
                    }
                },*/
                plugins: {
                    filler: {
                        propagate: false,
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                        },
                    },
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            drag: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        }
                    }
                },
                interaction: {
                    intersect: false,
                },
            }
        });
    }

    $scope.resetChart = function () {
        $scope.chart.resetZoom();
    }

    $scope.showPopupdmv = function () {
        $('#inputdmvPopup').modal({
            context: '.parent-container',
            closable: false,
        }).modal('show');
        var currentDate = new Date();
        var year = currentDate.getFullYear();
        var month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        var day = ('0' + currentDate.getDate()).slice(-2);
        document.getElementById('fromDate').max = year + '-' + month + '-' + day;
        document.getElementById('toDate').max = year + '-' + month + '-' + day;
        $scope.GetEarliestQueryDate();
    }
    $scope.showPopupevents = function () {
        $('#inputeventsPopup').modal({
            context: '.parent-container',
            closable: false,
        }).modal('show');
        var currentDate = new Date();
        var year = currentDate.getFullYear();
        var month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        var day = ('0' + currentDate.getDate()).slice(-2);
        document.getElementById('fromDateadhoc').max = year + '-' + month + '-' + day;
        document.getElementById('toDateadhoc').max = year + '-' + month + '-' + day;
        document.getElementById('fromDatesp').max = year + '-' + month + '-' + day;
        document.getElementById('toDatesp').max = year + '-' + month + '-' + day;
        $scope.GetEarliestSPDate();
        $scope.GetEarliestAdhocDate();
    }

    $scope.toggleFilterType = function (type) {
        if (type == 'abs') {
            document.getElementById('rel-div').style.borderColor = 'lightgray'
            document.getElementById('abs-div').style.borderColor = 'green'
            document.getElementById('fromDate').disabled = false
            document.getElementById('toDate').disabled = false
            document.getElementById('timeInput').disabled = true
            document.getElementById('formatInputDiv').style.pointerEvents = 'none'
            $('#formatInputDiv').removeClass('green')
        } else {
            document.getElementById('abs-div').style.borderColor = 'lightgray'
            document.getElementById('rel-div').style.borderColor = 'green'
            document.getElementById('fromDate').disabled = true
            document.getElementById('toDate').disabled = true
            document.getElementById('timeInput').disabled = false
            document.getElementById('formatInputDiv').style.pointerEvents = 'auto'
            $('#formatInputDiv').addClass('green')
        }
    }
    $scope.toggleFilterevent = function (type) {
        if (type == 'sp') {
            document.getElementById('abseventsadhoc').style.borderColor = 'lightgray'
            document.getElementById('abseventsSP').style.borderColor = 'green'
            document.getElementById('fromDatesp').disabled = false
            document.getElementById('toDatesp').disabled = false
            document.getElementById('fromDateadhoc').disabled = true
            document.getElementById('toDateadhoc').disabled = true
            document.getElementById('spspan').style.display = 'block'
            document.getElementById('adhocspan').style.display = 'none'
            document.getElementById('database').style.pointerEvents = 'auto'
            $('#database').addClass('green')
            
        } else {
            document.getElementById('abseventsSP').style.borderColor = 'lightgray'
            document.getElementById('abseventsadhoc').style.borderColor = 'green'
            document.getElementById('fromDatesp').disabled = true
            document.getElementById('toDatesp').disabled = true
            document.getElementById('fromDateadhoc').disabled = false
            document.getElementById('toDateadhoc').disabled = false
            document.getElementById('spspan').style.display = 'none'
            document.getElementById('adhocspan').style.display = 'block'
            document.getElementById('database').style.pointerEvents = 'none'
            $('#database').removeClass('green')
        }
    }

    $scope.filterQueries = function () {
        if ($scope.Database == undefined) {
            $scope.Database = { name:'Query'}
        }
        if (document.getElementsByName('filtertype')[0].checked) {
            $scope.filterType = 'rel'
        } else {
            $scope.filterType = 'abs'
        }
        if ($scope.filterType == 'abs') {
            if (document.getElementById('fromDate').value == '' || document.getElementById('toDate').value == '') {
                showMessage('Enter date range!');
                return;
            }
            var fromDate = new Date($scope.fromDate);
            var year = fromDate.getFullYear();
            var month = ('0' + (fromDate.getMonth() + 1)).slice(-2);
            var day = ('0' + fromDate.getDate()).slice(-2);
            $scope.fromDate = year + '-' + month + '-' + day;

            var toDate = new Date($scope.toDate);
            var year = toDate.getFullYear();
            var month = ('0' + (toDate.getMonth() + 1)).slice(-2);
            var day = ('0' + toDate.getDate()).slice(-2);
            $scope.toDate = year + '-' + month + '-' + day;
            $scope.hidedmvPopup();
            var db;
            if ($scope.Database.name == 'Query' || $scope.Database.name == undefined) {
                db = 'System Queries'
            } else {
                db = 'Database : ' + $scope.Database.name
            } 
            document.getElementById('filter-label').innerText = db + ', From ' + $scope.fromDate + ' To ' + $scope.toDate
            $scope.tabletype = 'dmv'
            $scope.FetchQueryHitListWithAbs();
        } else {
            if ($scope.time === undefined) {
                showMessage('Enter number of ' + $scope.timeFormat + 's to fetch queries!')
                return
            }
            $scope.hidedmvPopup();
            var db = $scope.Database.name == 'Query' ? 'System Queries' : 'Database : ' + $scope.Database.name
            var timeFormat = $scope.time == '1' ? $scope.timeFormat : $scope.timeFormat + 's'
            document.getElementById('filter-label').innerText = db + ', Past ' + $scope.time + ' ' + timeFormat 
            $scope.tabletype = 'dmv'
            $scope.FetchQueryHitList();
        }
    }
    $scope.filterEvents = function () {
        if ($scope.Database == undefined) {
            $scope.Database = { name:'DBAdmin'}
        }
        if (document.getElementsByName('eventype')[0].checked) {
            $scope.filterType = 'adhoc'
        } else {
            $scope.filterType = 'sp'
        }
        if ($scope.filterType == 'sp') {
            if (document.getElementById('fromDatesp').value == '' || document.getElementById('toDatesp').value == '') {
                showMessage('Enter date range!');
                return;
            }
            var fromDatesp = new Date($scope.fromDatesp);
            console.log($scope.fromDatesp)
            var year = fromDatesp.getFullYear();
            var month = ('0' + (fromDatesp.getMonth() + 1)).slice(-2);
            var day = ('0' + fromDatesp.getDate()).slice(-2);
            $scope.fromDatesp = year + '-' + month + '-' + day;

            var toDatesp = new Date($scope.toDatesp);
            var year = toDatesp.getFullYear();
            var month = ('0' + (toDatesp.getMonth() + 1)).slice(-2);
            var day = ('0' + toDatesp.getDate()).slice(-2);
            $scope.toDatesp = year + '-' + month + '-' + day;
            console.log($scope.toDatesp)
            $scope.hidedmvPopup();
            var db;
            if ($scope.Database.name == 'Query' || $scope.Database.name == undefined) {
                db = 'System Queries'
            } else {
                db = 'Database : ' + $scope.Database.name
            } 
            document.getElementById('filter-label-Events').innerText = 'SP ' + db + ', From ' + $scope.fromDatesp + ' To ' + $scope.toDatesp
            $scope.tabletype = 'sptable'
            $scope.FetchSP();
        } else {
            if (document.getElementById('fromDateadhoc').value == '' || document.getElementById('toDateadhoc').value == '') {
                showMessage('Enter date range!');
                return;
            }
            var fromDateadhoc = new Date($scope.fromDateadhoc);
            var year = fromDateadhoc.getFullYear();
            var month = ('0' + (fromDateadhoc.getMonth() + 1)).slice(-2);
            var day = ('0' + fromDateadhoc.getDate()).slice(-2);
            $scope.fromDateadhoc = year + '-' + month + '-' + day;

            var toDateadhoc = new Date($scope.toDateadhoc);
            var year = toDateadhoc.getFullYear();
            var month = ('0' + (toDateadhoc.getMonth() + 1)).slice(-2);
            var day = ('0' + toDateadhoc.getDate()).slice(-2);
            $scope.toDateadhoc = year + '-' + month + '-' + day;
            $scope.hidedmvPopup();
            document.getElementById('filter-label-Events').innerText = 'ADHOC From ' + $scope.fromDateadhoc + ' To ' + $scope.toDateadhoc
            $scope.tabletype = 'adhoctable'
            $scope.FetchAdhoc();
        }
    }

    $scope.changeView = function (view, event) {
        if (event != null) {
            $('.buttonset-button').siblings().removeClass('active');
            event.currentTarget.classList.add('active')
        } else {
            document.getElementById('split-view-button').classList.add('active');
            document.getElementById('hideChartButton').classList.remove('active');
            document.getElementById('fullChartButton').classList.remove('active');
        }
        document.getElementsByClassName('bottom-container-item')[0].style.height = 'auto'
        if (view == 'hide') {
            document.getElementById('chart-parent').style.padding = 0;
            $('#chart-parent').animate({
                height: "50px"
            });
            document.getElementById('analytics-chart').style.display = 'none'
            document.getElementsByClassName('table-responsive')[0].style.maxHeight = '76vh';
            document.getElementById('table-container').style.padding = '0 1rem';
            $('#chart-options').fadeOut();
        } else if (view == 'half') {
            document.getElementById('chart-parent').style.padding = '15px';
            $('#chart-parent').animate({
                height: "35vh"
            });
            document.getElementById('analytics-chart').style.display = 'block'
            document.getElementsByClassName('table-responsive')[0].style.maxHeight = '46vh';
            document.getElementById('table-container').style.padding = '0 1rem';
            $('#chart-options').fadeIn();
        } else {
            document.getElementById('chart-parent').style.padding = '15px';
            document.getElementById('analytics-chart').style.display = 'block'
            $('#chart-parent').animate({
                height: "84vh"
            });
            document.getElementById('table-container').style.padding = '40px 40px';
            $('#chart-options').fadeIn();
        }
    }

    $scope.changeFactor = function () {
        if ($scope.chartfactor == 'Count') { 
            var dataset = {
                 label: ' Execution Count',
                 data: executionCount,
                 borderWidth: 3,
                 backgroundColor: '#DB28283B',
                 borderColor: '#DB2828AD',
                 fill: true
            }
            $scope.chart.data.datasets = []
            $scope.chart.data.datasets.push(dataset);
            $scope.chart.options.scales.y.ticks.stepSize = 1;
            $scope.chart.update();
            console.log($scope.chart.data.datasets);
        } else if ($scope.chartfactor == 'Time') {
            var dataset = [
                {
                    label: ' Last Worker Time (ms)',
                    data: lastWorkerTime,
                    borderWidth: 3,
                    backgroundColor: '#27bc1a3b',
                    borderColor: '#20bb40ad',
                    fill: true
                }, {
                    label: ' Last Elapsed Time (ms)',
                    data: lastElapsedTime,
                    borderWidth: 3,
                    backgroundColor: '#2185D03B',
                    borderColor: '#2185D0AD',
                    fill: true
                }
            ]
            $scope.chart.data.datasets = []
            $scope.chart.data.datasets = dataset;
            $scope.chart.options.scales.y.ticks.stepSize = 500;
            $scope.chart.update();
        }
    }

    $scope.hidedmvPopup = function () {
        $('#inputdmvPopup').modal('hide');
    };$scope.hideeventsPopup = function () {
        $('#inputeventsPopup').modal('hide');
    };
});