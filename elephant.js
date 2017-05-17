$(document).ready(function() {
    (function($) {




        $.fn.elephant = function(options) {


            //VAR INIT

            // OPTIONS
            var settings = $.extend({
                triggers: new Array(),
                activeDuration: 30
            }, options);
            let page = window.location.pathname;
            var entry_list = new Array();
            var stats = {
                time: 0,
                scroll: 0,
                visit: 0,
                trigger: 0,
                favorite: 0,
                updated_at: new Date(),
                active: true,
                score: 0,
                position: 0
            }
            //var local_storage = {};
            var coeffs = {
                time: 1,
                scroll: 1,
                visit: 10,
                trigger: 10
            }
            var position_list = new Array();




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
                localStorage.setItem('elephant', jsonize(entry_list));
            }

            function loadElephant() {
                entry_list = unjsonize(localStorage.getItem('elephant'));
            }


            //ENTRIES
            var entryExists = function() {
                console.log('entryexists ???????????????');
                if (jQuery.inArray(page, entry_list) !== -1) {
                    return true;
                } else {
                    return false;
                }
            }
            var createEntry = function() {
                console.log('create entry');
                entry_list.push(page);
                localStorage.setItem('elephant', jsonize(entry_list));
                localStorage.setItem('elephant::' + page, jsonize(stats));
            }
            var loadEntry = function() {
                console.log('load entry :' + page);
                var page_data = unjsonize(localStorage.getItem('elephant::' + page));
                fillStats(page_data);
            }
            var loadEntryElephanto = function(entry) {
                console.log('load entry elephanto :' + entry);
                var page_data = unjsonize(localStorage.getItem('elephant::' + entry));
                fillStats(page_data);
            }
            var loadEntryForPosition = function(entry) {
                console.log('load entry for position :' + entry);
                return unjsonize(localStorage.getItem('elephant::' + entry));
            }

            var fillStats = function(page_data) {
                console.log('fill stats');
                for (var prop in page_data) {
                    if (!page_data.hasOwnProperty(prop)) continue;
                    if (prop != "updated_at") {
                        stats[prop] = page_data[prop];
                    } else {
                        stats[prop] = new Date(page_data[prop]);
                    }
                }
            }

            var updateEntry = function() {
                computeScore();
                localStorage.setItem('elephant::' + page, jsonize(stats));
            }

            var updateEntryForPosition = function(entry, data) {
                console.log('updateEntryForPosition')
                console.log(entry);
                console.log(data);
                localStorage.setItem('elephant::' + entry, jsonize(stats));
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
                switchActive(true);
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
                updateEntry();
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
                //console.log('checkActiveDuration:' + diff);
                if (diff > settings.activeDuration && stats.active == true) {
                    switchActive(false);
                }
            }



            //ELEPHANTO
            //IHM
            var displayData = function() {
                console.log('display data');

                console.log(entry_list);

                var list = "";
                list += "<ul>";
                /*
                $.each(entry_list, function(index, value) {
                    list += "<ul>";
                    list += "<li>" + value + "</li>";

                    loadEntryElephanto(value);

                    console.log('display stats !')
                    $.each(stats, function(key, val) {
                        list += "<li>" + key + " : " + val + "</li>";
                    });

                    list += "</ul>";
                });*/


                $.each(position_list, function(index, value) {
                  list += "<li>Position " + index + " : "+value+"<br /><br /></li>";
                });
                list += "</ul>";

                $('#elephanto').html(list);
            }
            //Calul score
            var computeScore = function() {
                console.log('computeScore');
                var score = 0;
                score += Math.round(stats.time * coeffs.time);
                score += Math.round(stats.visit * coeffs.visit);
                score += Math.round(stats.trigger * coeffs.trigger);
                score += Math.round(stats.scroll * coeffs.scroll);
                stats.score = score;
                computePosition();
            }
            //Calul position

            var computePosition = function() {
                console.log('computePosition');
                var score_list = new Array();
                var position = 0;

                $.each(entry_list, function(index, page) {
                    var tmp_entry = new Array();
                    tmp_entry['page'] = page;
                    tmp_entry['stats'] = loadEntryForPosition(entry_list[index]);
                    score_list.push(tmp_entry);
                });


                score_list.sort(function(a, b) {
                    return b.stats.score - a.stats.score;
                });
                console.log('SCORE LIST SORTEEEEEEEEEEEEEED');
                console.log(score_list);

                $.each(score_list, function(index, page) {
                    position_list[index] = page.page;
                    //page.stats.position = index;
                    //updateEntryForPosition(page.page, page.stats);
                });

                console.log('POSITION LISTTTTTTTTTTTTT');
                console.log(position_list);

                //Update local storage
                $.each(position_list, function(pos, page) {
                    console.log('pos');
                    console.log(pos);
                    console.log('page');
                    console.log(page);
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
                computePosition();
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
