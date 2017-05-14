$(document).ready(function() {
    (function($) {
        $.fn.elephant = function(options) {



            // OPTIONS  This is the easiest way to have default options.
            var settings = $.extend({
                // These are the defaults.
                timeRefresh: 1000,
                triggers: new Array()
                //backgroundColor: "yellow"
            }, options);

            var path = window.location.pathname;
            var stats = {
                time: 0,
                scroll: 0,
                visit: 0,
                trigger: 0,
                favorite: 0
            }





            function updateTime() {
                stats.time++;
                updateEntry();
            }

            var countSeconds = setInterval(function() {
                updateTime()
            }, 1000);



            var countScroll = function() {
                $(window).scroll(function(event) {
                    stats.scroll += 1;
                    updateEntry();
                });

            }

            var addVisit = function() {
                stats.visit += 1;
                updateEntry();
            }


            var countTrigger = function() {
                console.log('TRIGGER');
                $.each(settings.triggers, function(index, value) {
                    $(value).on('click', function() {
                        addTrigger();
                    })
                });
            }

            var addTrigger = function() {
                stats.trigger += 1;
                updateEntry();
            }


            var countFavorite = function() {
                $('#elephantAdd').on('click', function() {
                    if (stats.favorite == 1) {
                        stats.favorite = 0;
                    } else {
                        stats.favorite = 1;
                    }
                    updateEntry();
                });
            };



            var runElephant = function() {
                return $('div#elephant').length ? true : false;
            }
            var runElephanto = function() {
                return $('div#elephanto').length ? true : false;
            }


            var createEntry = function() {
                console.log('CREATE entry on : ' + path);
                localStorage.setItem(path, jsonize(stats));
            }

            var updateEntry = function() {
                //console.log('UPDATE entry on : ' + path);
                //console.log(stats);
                localStorage.setItem(path, jsonize(stats));
            }


            var entryExists = function() {
                if (localStorage.getItem(path) == null) {
                    return false;
                } else {
                    return true;
                }
            }

            var loadEntry = function() {
                var data = unjsonize(localStorage.getItem(path));
                console.log('LOAD ENTRY');
                stats.time = data.time;
                stats.scroll = data.scroll;
                stats.visit = data.visit;
                stats.trigger = data.trigger;
                stats.favorite = data.favorite;
                console.log(stats);
            }



            var displayData = function() {


                $.each(settings.triggers, function(index, value) {
                    $(value).on('click', function() {
                        addTrigger();
                    })
                });

            }




            function jsonize(data) {
                return JSON.stringify(data);
            }

            function unjsonize(data) {
                return jQuery.parseJSON(data);
            }







            if (runElephant()) {
              console.log('run elephant');

                if (!entryExists()) {
                    createEntry();
                }

                loadEntry();
                //countSeconds();
                countScroll();
                addVisit();
                countTrigger();
                countFavorite();




                //TMP DEV
                $('#reset').on('click', function() {
                    stats.time = 0;
                    stats.scroll = 0;
                    stats.visit = 0;
                    stats.trigger = 0;
                    stats.favorite = 0;
                    updateEntry();
                })

            }


            if(runElephanto()){
              console.log('run elephanto !');

              displayData();


            }




            /*
            // Greenify the collection based on the settings variable.
            return this.css({
                color: settings.color,
                backgroundColor: settings.backgroundColor
            });
            */

        };
    }(jQuery));
});



$(document).ready(function() {

    $.fn.elephant({
        triggers: new Array('.trigger1', '.trigger2')
    });



});
