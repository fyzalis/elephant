$(document).ready(function() {
    (function($) {




        $.fn.elephant = function(options) {



            // OPTIONS  This is the easiest way to have default options.
            var settings = $.extend({
                // These are the defaults.
                //timeRefresh: 1000,
                triggers: new Array(),
                activeDuration: 30
                //backgroundColor: "yellow"
            }, options);

            var path = window.location.pathname;
            var stats = {
                time: 0,
                scroll: 0,
                visit: 0,
                trigger: 0,
                favorite: 0,
                updated_at: new Date(),
                active: true
            }

            var local_storage = {};




            function updateTime() {
              checkActiveDuration();
              if(stats.active){
                stats.time++;
                updateEntry();
              }
            }


            function checkActiveDuration(){
              var now = new Date();
              var sec1 = stats.updated_at.getTime()/1000;
              var sec2 = now.getTime()/1000;
              var diff = Math.round(sec2-sec1);
              console.log('diff:'+diff);
              if(diff>settings.activeDuration){
                setActive(false);
              }
            }


            var countScroll = function() {
                $(window).scroll(function(event) {
                    setActive(true);
                    stats.scroll += 1;
                    updateEntry();
                });

            }

            var addVisit = function() {
                console.log('ADD VISITE');
                stats.visit += 1;
                updateEntry();
            }


            var countTrigger = function() {

                $.each(settings.triggers, function(index, value) {
                    $(value).on('click', function() {
                        addTrigger();
                    })
                });
            }

            var addTrigger = function() {
                setActive(true);
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

            var setActive = function(active){
              console.log('SET ACTIVE : '+active);
              stats.updated_at = new Date();
              stats.active = active;
            }






            var runElephant = function() {
                return $('div#elephant').length ? true : false;
            }
            var runElephanto = function() {
                return $('div#elephanto').length ? true : false;
            }


            var entryExists = function() {
                console.log('ENTRY EXISTS ?');
                console.log(local_storage);


                console.log(local_storage[path]);

                if (local_storage.hasOwnProperty(path)) {
                    console.log('true');
                    return true;
                } else {
                    console.log('false');
                    return false;
                }
            }
            var elephantExists = function() {
                if (localStorage.getItem('elephant') == null) {
                    return false;
                } else {
                    return true;
                }
            }
            var createElephant = function() {
                console.log('CREATE ELEPHANT on : ' + path);
                localStorage.setItem('elephant', jsonize({}));
            }

            var createEntry = function() {
                console.log('CREATE entry on : ' + path);

                local_storage[path] = stats;

                localStorage.setItem('elephant', jsonize(local_storage));
            }

            function loadElephant() {
                console.log('LOAD ELEPHANT');

                local_storage = unjsonize(localStorage.getItem('elephant'));
                console.log(local_storage);

            }

            var loadEntry = function() {
                console.log('LOAD ENTRY');
                var data = local_storage[path];
                console.log(data);
                stats.time = data.time;
                stats.scroll = data.scroll;
                stats.visit = data.visit;
                stats.trigger = data.trigger;
                stats.favorite = data.favorite;
                console.log(data);
            }


            var updateEntry = function() {
                console.log('UPDATE ENTRY');
                console.log(stats);
                if(stats.active){
                  local_storage[path] = stats;
                  localStorage.setItem('elephant', jsonize(local_storage));
                }
            }




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








            function jsonize(data) {
                return JSON.stringify(data);
            }

            function unjsonize(data) {
                return jQuery.parseJSON(data);
            }







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

                setInterval(function() {
                    updateTime()
                }, 1000);

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


            if (runElephanto()) {
                console.log('run elephanto !');


                if (!elephantExists()) {
                    console.log('CREATE ELEPHANT');
                    createElephant();
                }

                loadElephant();

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
        triggers: new Array('.trigger1', '.trigger2'),
        activeDuration: 5
    });



});
