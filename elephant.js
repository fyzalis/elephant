$(document).ready(function() {
    (function($) {




        $.fn.elephant = function(options) {


            //VAR INIT

            // OPTIONS
            var settings = $.extend({
                triggers: new Array(),
                activeDuration: 30
            }, options);
            let path = window.location.pathname;
            var stats = {
                time: 0,
                scroll: 0,
                visit: 0,
                trigger: 0,
                favorite: 0,
                updated_at: new Date(),
                active: true,
                score: 0
            }
            var local_storage = {};
            var coeffs = {
                time: 1,
                scroll: 1,
                visit: 10,
                trigger: 10
            }




            //FUNCTIONS

            //MAIN
            var runElephant = function() {
                console.log('run elephant ?')
                return $('div#elephant').length ? true : false;
            }
            var runElephanto = function() {
                console.log('run elephanto ?')
                return $('div#elephanto').length ? true : false;
            }

            //ELEPHANT
            var elephantExists = function() {
                console.log('elephant exists');
                if (localStorage.getItem('elephant') == null) {
                    return false;
                } else {
                    return true;
                }
            }
            var createElephant = function() {
                console.log('create elephant');
                localStorage.setItem('elephant', jsonize({}));
            }

            function loadElephant() {
                console.log('load elephant');
                local_storage = unjsonize(localStorage.getItem('elephant'));
            }


            //ENTRIES
            var entryExists = function() {
                console.log('entryexists ?');
                if (local_storage.hasOwnProperty(path)) {
                    return true;
                } else {
                    return false;
                }
            }
            var createEntry = function() {
                console.log('create entry');
                local_storage[path] = stats;
                localStorage.setItem('elephant', jsonize(local_storage));
            }
            var loadEntry = function() {
                console.log('load entry' + path);
                var data = local_storage[path];
                stats.time = data.time;
                stats.scroll = data.scroll;
                stats.visit = data.visit;
                stats.trigger = data.trigger;
                stats.favorite = data.favorite;
                console.log(stats);
            }
            var updateEntry = function() {
                console.log('update entry');
                if (stats.active) {
                    console.log('stats / local storage');
                    local_storage[path] = stats;
                    console.log(stats);
                    console.log(local_storage);
                    localStorage.setItem('elephant', jsonize(local_storage));
                }
            }







            //Counters
            function updateTime() {
                console.log('updateTime');
                checkActiveDuration();
                if (stats.active) {
                    stats.time++;
                    updateEntry();
                }
            }
            var countScroll = function() {
                console.log('countScroll');
                $(window).scroll(function(event) {
                    switchActive(true);
                    stats.scroll += 1;
                    updateEntry();
                });

            }
            var addVisit = function() {
                console.log('add visite');
                stats.visit += 1;
                updateEntry();
            }

            var addTrigger = function() {
                console.log('addTrigger');
                switchActive(true);
                stats.trigger += 1;
                updateEntry();
            }


            //Switch
            function switchFavorite() {
                console.log('switchFavorite');
                if (stats.favorite == 1) {
                    stats.favorite = 0;
                    updateEntry();
                } else {
                    stats.favorite = 1;
                    switchActive(true);
                }
            }
            var switchActive = function(active) {
                console.log('setActive' + active);
                if (active) {
                    stats.updated_at = new Date();
                }
                stats.active = active;
            }

            //Events
            var countTrigger = function() {
                console.log('countTrigger');
                $.each(settings.triggers, function(index, value) {
                    $(value).on('click', function() {
                        addTrigger();
                    })
                });
            }

            var countFavorite = function() {
                console.log('countFavorite');
                $('#elephantAdd').on('click', function() {
                    switchFavorite();
                    updateEntry();
                });
            };


            //Check user activity
            function checkActiveDuration() {
                var now = new Date();
                var sec1 = stats.updated_at.getTime() / 1000;
                var sec2 = now.getTime() / 1000;
                var diff = Math.round(sec2 - sec1);
                console.log('checkActiveDuration:' + diff);
                if (diff > settings.activeDuration && stats.active == true) {
                    switchActive(false);
                }
            }



            //ELEPHANTO
            //IHM
            var displayData = function() {
                console.log('display data');
                var list = "";
                $.each(local_storage, function(index, value) {
                    list += "<ul>";
                    list += "<li>" + index + "</li>";
                    $.each(value, function(key, val) {
                        list += "<li>" + key + " : " + val + "</li>";
                    });
                    list += "</ul>";
                });
                $('#elephanto').html(list);
            }
            //Calul score
            var computeScore = function() {
                console.log('computeScore');
                $.each(local_storage, function(index, value) {
                    var score = 0;
                    $.each(value, function(key, val) {
                        if (key == 'time' || key == 'visit' || key == 'trigger' || key == 'scroll'){
                          score += Math.round(local_storage[index][key] * coeffs[key]);
                        }
                    });
                    local_storage[index]['score'] = score;
                });
            }




            //Utilities
            function jsonize(data) {
                return JSON.stringify(data);
            }

            function unjsonize(data) {
                return jQuery.parseJSON(data);
            }


            //Auto RunS


            //Record page variables
            if (runElephant()) {
                console.log('run elephant');
                if (!elephantExists()) {
                    console.log('CREATE ELEPHANT');
                    createElephant();
                }
                loadElephant();
                if (!entryExists()) {
                    createEntry();
                }
                loadEntry();

                //Init action detection
                setInterval(function() {
                    updateTime()
                }, 1000);
                countScroll();
                addVisit();
                countTrigger();
                countFavorite();

                //TMP DEV
                //Reset Local storage
                $('#reset').on('click', function() {
                    createElephant();
                })
            }



            //Display Local Storage Datas
            if (runElephanto()) {
                console.log('run elephanto !');
                if (!elephantExists()) {
                    console.log('CREATE ELEPHANT');
                    createElephant();
                }
                loadElephant();
                computeScore();
                displayData();
            }
        };
    }(jQuery));
});



$(document).ready(function() {

    $.fn.elephant({
        triggers: new Array('.trigger1', '.trigger2'),
        activeDuration: 5
    });



});
