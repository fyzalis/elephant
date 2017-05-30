$(document).ready(function() {
  (function($) {

    $.fn.elephant = function(options) {

      var settings = $.extend({
        triggers: new Array(),
        activeDuration: 30,
        refreshRender: 1,
        maxDisplayedResult: 5,
        moreText: 'Vos pages favorites',
        favoriteTrigger: '#elephant_favorite',
        favoriteIcon: '&hearts;',
        favoriteOffText: "Cette page m'intéresse",
        favoriteOnText: "Cette page ne m'intéresse plus",
        path: "",
        theme: "default"
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
      var position_has_changed = false;
      var force_render = true;
      var expand_view = false;

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
        changeFavoriteRender();
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
        $(settings.favoriteTrigger).on('click', function() {
          force_render = true;
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
      var listenOpen = function() {
        $('#elephanto div.open').off();
        $('#elephanto div.open').on('click', function() {
          expand_view = !expand_view;
          openElephanto();
        });
      };
      var listenExit = function() {
        $('#elephanto span.exit').off();
        $('#elephanto span.exit').on('click', function() {
          $('#elephanto').toggle();
          clearInterval(refreshData);
        });
      };

      var listenLink = function() {
        $('#elephanto ul li').off('click');
        $('#elephanto ul li').on('click', function() {
          location.href = $(this).data('url');
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

      //Display favorite
      var displayFavorite = function() {
        if ($(settings.favoriteTrigger).length > 0) {
          var favorite_block = "";
          var favorite_off_class = "";
          var favorite_on_class = "";

          if (stats.favorite) {
            favorite_on_class = "active";
          } else {
            favorite_off_class = "active";
          }

          favorite_block += "<div id='elephant_favorite_off' class='" + favorite_off_class + "'>";
          favorite_block += "<span class='elephant_favorite_off'>" + settings.favoriteIcon + "</span>";
          favorite_block += "<span>" + settings.favoriteOffText + "</span>";
          favorite_block += "</div>";
          favorite_block += "<div id='elephant_favorite_on' class='" + favorite_on_class + "'>";
          favorite_block += "<span class='elephant_favorite_on'>" + settings.favoriteIcon + "</span>";
          favorite_block += "<span>" + settings.favoriteOnText + "</span>";
          favorite_block += "</div>";

          $('#elephant_favorite').html(favorite_block);
        }
      }

      //Switch favorite 'button' render
      var changeFavoriteRender = function() {
        if (stats.favorite) {
          $('#elephant_favorite_off').removeClass('active');
          $('#elephant_favorite_on').addClass('active');
        } else {
          $('#elephant_favorite_off').addClass('active');
          $('#elephant_favorite_on').removeClass('active');
        }
      }



      //ELEPHANTO
      var openElephanto = function() {
        if (expand_view) {
          $('#elephanto span.symbol').html('&#8615;');
          $('#elephanto li:not(.first)').fadeToggle("slow", "swing");
        } else {
          $('#elephanto span.symbol').html('&#8613;');
          $('#elephanto li:not(.first)').toggle();
        }
      }
      var displayData = function() {
        if (position_list.length > 0 && (position_has_changed || force_render)) {
          var list = "";
          var cnt = 0;
          var symbol = expand_view ? '&#8615;' : '&#8613';
          var displayed_entries = position_list.length>settings.maxDisplayedResult ? settings.maxDisplayedResult : position_list.length;

          force_render = false;
          position_has_changed = false;

          list += "<div class='open'><span class='symbol'>" + symbol + "</span> <span class='text'>" + settings.moreText + " ("+displayed_entries+")</span><span class='exit'>&#10006;</span></div>";
          list += "<ul>";

          $.each(position_list, function(index, value) {
            if (cnt < settings.maxDisplayedResult) {
              var metas = unjsonize(localStorage.getItem('elephanto::' + value));
              var stat = unjsonize(localStorage.getItem('elephant::' + value));
              var positionClass = cnt == 0 ? 'first' : "";

              list += "<li data-score='" + stat.score + "' data-position='" + cnt + "' data-favorite='" + stat.favorite + "' data-url='" + metas.page + "' class='" + positionClass + "'>";
              if (metas.image) {
                list += "<img src='" + metas.image + "' />";
              }
              if (metas.text) {
                list += "<span class='text'>" + metas.text + "</span>";
              }
              if (stat.favorite) {
                list += "<span class='elephant_favorite_on'>" + settings.favoriteIcon + "</span>";
              }
              list += "</li>";
              cnt++;
            } else {
              return false;
            }
          });

          list += "</ul>";
          $('#elephanto').html(list);

          if (expand_view) {
            openElephanto();
          }

          listenLink();
          listenOpen();
          listenExit();
        }
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

        var lastPositionList = getLastPositionList();
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
        $.each(position_list, function(index, page) {
          if (position_list[index] !== lastPositionList[index]) {
            position_has_changed = true;
          }
        });

        saveLastPositionList();
      }


      var saveLastPositionList = function() {
        localStorage.setItem('elephant_position_list', jsonize(position_list));
      }
      var getLastPositionList = function() {
        return unjsonize(localStorage.getItem('elephant_position_list'));
      }


      var loadTheme = function() {
        if (settings.theme != "default") {
          $("head").append($("<link rel='stylesheet' href='" + settings.path + "/themes/" + settings.theme + "/" + settings.theme + ".min.css' type='text/css' media='screen' />"));
        }
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


      //RUN

      //Elephant : record data
      if (runElephant()) {
        if (!elephantExists()) {
          createElephant();
        }
        loadElephant();
        if (!entryExists()) {
          createEntry();
        }
        loadEntry();
        displayFavorite();
        setInterval(function() {
          incrementTime()
        }, 1000);
        listenScroll();
        incrementVisit();
        listenTrigger();
        listenFavorite();
      }

      //Elephanto : display data
      if (runElephanto()) {
        if (!elephantExists()) {
          createElephant();
        }
        loadTheme();
        loadElephant();
        computePosition();
        displayData();
        var refreshData = setInterval(function() {
          loadElephant();
          computePosition();
          displayData();
        }, (settings.refreshRender * 1000));
      }
    };
  }(jQuery));
});
