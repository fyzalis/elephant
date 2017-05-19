$(document).ready(function() {
    (function($) {

        $.fn.elephant = function(options) {

            //VAR INIT

            // OPTIONS
            var settings = $.extend({
                triggers: new Array(),
                activeDuration: 30
            }, options);
            var page = window.location.pathname;
            var meta = {
                page: page,
                text: "",
                image: ""
            };
            var entry_list = new Array();
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
                return $('div#elephant').length ? true : false;
            }
            var runElephanto = function() {
                return $('div#elephanto').length ? true : false;
            }

            //ELEPHANT
            var elephantExists = function() {
                if (localStorage.getItem('elephant') == null) {
                    return false;
                } else {
                    return true;
                }
            }
            var createElephant = function() {
                localStorage.setItem('elephant', jsonize(entry_list));
            }

            function loadElephant() {
                entry_list = unjsonize(localStorage.getItem('elephant'));
            }


            //ENTRIES
            var entryExists = function() {
                if (jQuery.inArray(page, entry_list) !== -1) {
                    return true;
                } else {
                    return false;
                }
            }
            var createEntry = function() {
                entry_list.push(page);
                localStorage.setItem('elephant', jsonize(entry_list));
                localStorage.setItem('elephant::' + page, jsonize(stats));
                meta.text = $('#elephant').data('text');
                meta.image = $('#elephant').data('image');
                localStorage.setItem('elephanto::' + page, jsonize(meta));
            }
            var loadEntry = function() {
                var page_data = unjsonize(localStorage.getItem('elephant::' + page));
                fillStats(page_data);
            }
            var loadEntryElephanto = function(entry) {
                var page_data = unjsonize(localStorage.getItem('elephant::' + entry));
                fillStats(page_data);
            }
            var loadEntryForPosition = function(entry) {
                return unjsonize(localStorage.getItem('elephant::' + entry));
            }

            var fillStats = function(page_data) {
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





            //Counters
            function incrementTime() {
                checkActiveDuration();
                if (stats.active) {
                    stats.time++;
                    updateEntry();
                }
            }

            var incrementVisit = function() {
                stats.visit += 1;
                switchActive(true);
                updateEntry();
            }

            var incrementTrigger = function() {
                switchActive(true);
                stats.trigger += 1;
                updateEntry();
            }


            //Switch
            function switchFavorite() {
                if (stats.favorite == 1) {
                    stats.favorite = 0;
                    updateEntry();
                } else {
                    stats.favorite = 1;
                    switchActive(true);
                }
            }
            var switchActive = function(active) {
                if (active) {
                    stats.updated_at = new Date();
                }
                stats.active = active;
                updateEntry();
            }



            //Events
            var listenTrigger = function() {
                $.each(settings.triggers, function(index, value) {
                    $(value).on('click', function() {
                        incrementTrigger();
                    })
                });
            }
            var listenFavorite = function() {
                $('#elephantAdd').on('click', function() {
                    switchFavorite();
                    updateEntry();
                });
            };
            var listenScroll = function() {
                $(window).scroll(function(event) {
                    switchActive(true);
                    stats.scroll += 1;
                    updateEntry();
                });

            }


            //Check user activity
            var checkActiveDuration = function() {
                var now = new Date();
                var sec1 = stats.updated_at.getTime() / 1000;
                var sec2 = now.getTime() / 1000;
                var diff = Math.round(sec2 - sec1);
                if (diff > settings.activeDuration && stats.active == true) {
                    switchActive(false);
                }
            }



            //ELEPHANTO
            //IHM
            var displayData = function() {
                var list = "";
                list += "<ul>";
                $.each(position_list, function(index, value) {
                    var metas = unjsonize(localStorage.getItem('elephanto::' + value));
                    var stat = unjsonize(localStorage.getItem('elephant::' + value));
                    list += "<li>";
                    list += "<a href='" + metas.page + "'>";
                    list += metas.text;
                    list += "</a> (score :" + stat.score + ")(favorite : " + stat.favorite + ")<br />";
                    list += "<img src='" + metas.image + "' style='width:30px;' />";
                    if (stat.favorite) {
                        list += "<img src='/star-icon.png' />";
                    }
                    list += "<hr />";
                    list += "</li>";
                });
                list += "</ul>";
                $('#elephanto').html(list);
            }
            //Calul score
            var computeScore = function() {
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
                var score_list = new Array();
                var favorite_list = new Array();
                var no_favorite_list = new Array();
                var i = 0;
                $.each(entry_list, function(index, page) {
                    var tmp_entry = new Array();
                    tmp_entry['page'] = page;
                    tmp_entry['stats'] = loadEntryForPosition(entry_list[index]);
                    if (tmp_entry['stats'].favorite) {
                        favorite_list.push(tmp_entry);
                    } else {
                        no_favorite_list.push(tmp_entry);
                    }
                });
                favorite_list.sort(function(a, b) {
                    return b.stats.score - a.stats.score;
                });
                no_favorite_list.sort(function(a, b) {
                    return b.stats.score - a.stats.score;
                });
                $.each(favorite_list, function(index, page) {
                    position_list[i] = page.page;
                    i++;
                });
                $.each(no_favorite_list, function(index, page) {
                    position_list[i] = page.page;
                    i++
                });
            }


            //Utilities
            function debug(data, title) {
                if (!title) title = 'DEBUG';
                console.log(title, data);
            }

            function jsonize(data) {
                return JSON.stringify(data);
            }

            function unjsonize(data) {
                return jQuery.parseJSON(data);
            }


            //Auto RunS

            //Record page variables
            if (runElephant()) {
                if (!elephantExists()) {
                    createElephant();
                }
                loadElephant();
                if (!entryExists()) {
                    createEntry();
                }
                loadEntry();

                //Init action detection
                setInterval(function() {
                    incrementTime()
                }, 1000);
                listenScroll();
                incrementVisit();
                listenTrigger();
                listenFavorite();
            }



            //Display Local Storage Datas
            if (runElephanto()) {
                if (!elephantExists()) {
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
