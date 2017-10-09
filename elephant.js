/*
 2017-07-13: dev v1.4
 Github: https://github.com/fyzalis/elephant
 Author: Julien Buabent
*/

$(document).ready(function() {
  (function($) {

    $.fn.elephant = function(options) {



      var settings = $.extend({
        triggers: new Array(),
        activeDuration: 30,
        refreshRender: 1,
        maxDisplayedResult: 5,
        title: 'My selection',
        entryName: {
          'one': '',
          'several': ''
        },
        favoriteTrigger: '#elephant_favorite',
        path: "",
        theme: "default",
        lang: "en"
      }, options);
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
        scroll: 0.5,
        visit: 30,
        trigger: 100
      }
      var position_list = new Array();
      var position_has_changed = false;
      var force_render = true;
      var entry_list = new Array();

      //Ugly
      var view_state = localStorage.getItem('elephant_view');
      if (view_state == "" || view_state == null) {
        view_state = "visible";
      }

      //Ugly and not safe on type verification
      var latest_position_change = unjsonize(localStorage.getItem('elephant_position_has_changed'));
      if (latest_position_change == null) {
        var latest_position_change = {};
        latest_position_change.time = new Date();
        latest_position_change.selector = "";
        localStorage.setItem('elephant_position_has_changed', jsonize(latest_position_change));
      }


      var page = window.location.href;
      var themePath = settings.path + "/themes/" + settings.theme;
      var meta = {
        page: page,
        text: "",
        image: "",
        id: ""
      };
      var displayMode = "normal";
      var removedEntry = false;
      var lang = {};


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
        localStorage.setItem('elephant_view', "visible");
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
        if (entry_list.length >= 20) {
          console.error("Max recording size for elephant is limited to 20 entries. No more entry will be added before remove at least another.");
          return false;
        }
        entry_list.push(page);
        localStorage.setItem('elephant', jsonize(entry_list));
        localStorage.setItem('elephant::' + page, jsonize(stats));
        meta.text = $('#elephant').data('text');
        meta.image = $('#elephant').data('image');
        meta.id = $('#elephant').data('id');
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
        if (removedEntry) {
          console.error("This entry has just been removed from list by user.");
          return false;
        }
        computeScore();
        localStorage.setItem('elephant::' + page, jsonize(stats));
      }

      var removeEntry = function(entry) {
        removedEntry = true;
        var entryIndex = 0;
        entryIndex = entry_list.indexOf(entry);
        if (entryIndex > -1) {
          entry_list.splice(entryIndex, 1);
        }
        localStorage.setItem('elephant', jsonize(entry_list));
        localStorage.removeItem('elephant::' + entry);
        localStorage.removeItem('elephanto::' + entry);
        lastPostionList = getLastPositionList();
        entryIndex = lastPostionList.indexOf(entry);
        if (entryIndex > -1) {
          lastPostionList.splice(entryIndex, 1);
        }
        saveLastPositionList();
        force_render = true;
        computePosition();
        displayData();
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
          displayData();
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
          displayMode = "normal";
          switchToNormalMode();
          openElephanto();
        });
      };
      var listenLink = function() {
        $('#elephanto div.list div.entry div.favorite, #elephanto div.list div.entry div.image, #elephanto div.list div.entry div.text').off('click');
        $('#elephanto div.list div.entry div.favorite, #elephanto div.list div.entry div.image, #elephanto div.list div.entry div.text').on('click', function() {
          location.href = $(this).data('url');
        });
      }
      var listenRemove = function() {
        $('#elephanto div.list div.entry div.remove img').off('click');
        $('#elephanto div.list div.entry div.remove img').on('click', function() {
          removeEntry($(this).data('entry'));
        });
      }
      var listenInfo = function() {
        $('#elephanto div.info img.info').off('click');
        $('#elephanto div.info img.info').on('click', function() {
          var close = " <span class='informations' id='infoClose'>Fermer</span>";
          $('#elephanto div.info').html(lang.pluginInformation + close);
          $('#elephanto div.info span#infoClose').off('click');
          $('#elephanto div.info span#infoClose').on('click', function() {
            force_render = true;
            displayData();
          });
        });
        $('#elephanto div.info img.clear_elephant').off('click');
        $('#elephanto div.info img.clear_elephant').on('click', function() {
          var confirm = " <span class='clearConfirm' id='clearOn'>" + lang.yes + "</span> | <span class='clearConfirm' id='clearOff'>" + lang.no + "</span>";
          $('#elephanto div.info').html(lang.clearText + confirm);
          $('#elephanto div.info span#clearOn, #elephanto div.info span#clearOff').off('click');
          $('#elephanto div.info span#clearOn').on('click', function() {
            $('#elephanto').css('display', 'none');
            localStorage.clear();
          });
          $('#elephanto div.info span#clearOff').on('click', function() {
            force_render = true;
            displayData();
          });


        });
        $('#elephanto div.info img.see_other').off('click');
        $('#elephanto div.info img.see_other').on('click', function() {
          if (displayMode == "normal") {
            switchToSeeOtherMode();
          } else if (displayMode == "see_other") {
            switchToNormalMode();
          }
          displayData();
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
      var checkPositionChange = function() {
        var tmp_local_storage = unjsonize(localStorage.getItem('elephant_position_has_changed'));
        if(tmp_local_storage != null){
          if (tmp_local_storage.time != "" && tmp_local_storage.selector != "") {
            var tmp_position = new Date(tmp_local_storage.time);
            var tmp_latest = new Date(latest_position_change.time);
            if (tmp_position.getTime() > tmp_latest.getTime()) {
              force_render = true;
              displayData();
              highLightNewPosition(tmp_local_storage.selector);
              latest_position_change.time = tmp_local_storage.time;
              latest_position_change.selector = "";
              localStorage.setItem('elephant_position_has_changed', jsonize(latest_position_change));
            }
          }
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
          favorite_block += "<span class='elephant_favorite_off'><img src='" + themePath + "/favorite-off.png' /></span>";
          favorite_block += "<span class='text'>" + lang.favoriteOffText + "</span>";
          favorite_block += "</div>";

          favorite_block += "<div id='elephant_favorite_on' class='" + favorite_on_class + "'>";
          favorite_block += "<span class='elephant_favorite_on'><img src='" + themePath + "/favorite-on.png' /></span>";
          favorite_block += "<span class='text'>" + lang.favoriteOnText + "</span>";
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
        if (view_state == "visible" || view_state == "reduce") {
          $('#elephanto div.open div.switch_view img.expand').css('display', 'none');
          $('#elephanto div.open div.switch_view img.reduce').css('display', 'block');
          $('#elephanto div.list').css('display', 'block');
          $('#elephanto div.list div.entry:not(.hiddenEntry)').css('display', 'flex');
          view_state = "expand";
        } else if (view_state == "expand") {
          $('#elephanto div.open div.switch_view img.expand').css('display', 'block');
          $('#elephanto div.open div.switch_view img.reduce').css('display', 'none');
          $('#elephanto div.list').toggle();
          view_state = "reduce";
        } else {
          view_state = "visible";
        }
        if (view_state == "expand") {
          $('div#elephanto div.info').css('display', 'block');
        } else {
          $('div#elephanto div.info').css('display', 'none');
        }
        localStorage.setItem('elephant_view', view_state);
        return true;
      }

      var displayData = function() {
        if (position_list.length > 0 && (position_has_changed || force_render)) {
          var list = "";
          var cnt = 0;
          var entry_name = position_list.length > 1 ? settings.entryName.several : settings.entryName.one;
          var metas = "";
          var stat = "";
          var positionClass = "";
          var hiddenClass = "";
          var favoriteIcon = "";
          force_render = false;
          position_has_changed = false;

          list += "<div class='open'>";
          list += "<div class='logo'><img src='" + themePath + "/logo.png' /></div>";
          list += "<div class='text'>" + settings.title + "<span class='count'>" + position_list.length + entry_name + "</span></div>";
          list += "<div class='switch_view'>";
          list += "<img class='expand' src='" + themePath + "/open.png' />";
          list += "<img class='reduce' src='" + themePath + "/reduce.png' />";
          list += "</div>";
          list += "</div>";
          list += "<div class='list'>";


          $.each(position_list, function(index, value) {
            metas = unjsonize(localStorage.getItem('elephanto::' + value));
            stat = unjsonize(localStorage.getItem('elephant::' + value));
            positionClass = cnt == 0 ? 'first' : "";
            favoriteIcon = stat.favorite ? themePath + "/favorite-on.png" : themePath + "/favorite-off.png";
            hiddenClass = cnt < settings.maxDisplayedResult ? "" : "hiddenEntry";

            list += "<div class='entry " + positionClass + " " + hiddenClass + "' data-score='" + stat.score + "' data-position='" + cnt + "' data-favorite='" + stat.favorite + "' data-url='" + metas.page + "'>";
            list += "<div class='favorite' data-url='" + metas.page + "'><img src='" + favoriteIcon + "' /></div>";

            if (metas.image) {
              list += "<div class='image' data-url='" + metas.page + "'><img src='" + metas.image + "'  /></div>";
            }
            if (metas.text) {
              list += "<div class='text' data-url='" + metas.page + "'>" + metas.text + "</div>";
            }

            list += "<div class='remove'><img src='" + themePath + "/remove.png' data-entry='" + value + "' /></div>";
            list += "</div>";
            cnt++;
          });

          list += "</div>";
          list += "<div class='info'>";
          if (cnt > settings.maxDisplayedResult) {
            list += "<span id='see_other_text'>" + lang.displayModeText.normal + "</span> <img class='see_other' src='" + themePath + "/see.png'>";
          }
          list += "Infos <img class='info' src='" + themePath + "/info.png'>";
          list += lang.clear + " <img class='clear_elephant' src='" + themePath + "/clear.png' />";
          list += "</div>";

          $('#elephanto').html(list);

          if (displayMode == "normal") {
            switchToNormalMode();
          } else if (displayMode == "see_other") {
            switchToSeeOtherMode();
          }

          if (view_state == "expand" && displayMode == "see_other") {
            $('div#elephanto div.info').css('display', 'block');
          }

          if (view_state == "expand") {
            $('div#elephanto div.info').css('display', 'block');
          }

          if (position_list.length == 1) {
            $("div#elephanto div.open div.switch_view img.reduce").css('display', 'block');
            $("div#elephanto div.open div.switch_view img.expand").css('display', 'none');
          }

          listenLink();
          listenOpen();
          listenRemove();
          listenInfo();
          autoSwitchView();
        }

        if (position_list.length == 0) {
          $('#elephanto').html("");
        }

      }

      var autoSwitchView = function() {
        view_state = localStorage.getItem('elephant_view');
        if (view_state == "reduce") {
          $('#elephanto div.list').css('display', 'none');
          $("div#elephanto div.open div.switch_view img.reduce").css('display', 'none');
          $("div#elephanto div.open div.switch_view img.expand").css('display', 'block');
        } else if (view_state == "expand") {
          $('#elephanto div.list').css('display', 'block');
          $('#elephanto div.list div.entry:not(.hiddenEntry)').css('display', 'flex');
          $("div#elephanto div.open div.switch_view img.reduce").css('display', 'block');
          $("div#elephanto div.open div.switch_view img.expand").css('display', 'none');
        }
      }

      var switchToSeeOtherMode = function() {
        displayMode = "see_other";
        $('#see_other_text').html(lang.displayModeText.see_other);
        $('div#elephanto').css('height', $(window).height() + 'px');
        $('div#elephanto div.list').css('overflow-y', 'auto');
        $('div#elephanto div.list div.entry.hiddenEntry').css('display', 'flex');
      }

      var switchToNormalMode = function() {
        displayMode = "normal";
        $('#see_other_text').html(lang.displayModeText.normal);
        $('div#elephanto').css('height', 'inherit');
        $('div#elephanto div.list').css('overflow-y', 'auto');
        $('div#elephanto div.list div.entry.hiddenEntry').css('display', 'none');
      }

      var highLightNewPosition = function(selector) {
        var divBackgroundColor = $('div#elephanto div.entry[data-url="' + selector + '"]').css('background-color');
        $('div#elephanto div.entry[data-url="' + selector + '"]').css('background-color', '#ccc');
        window.setTimeout(function() {
          $('div#elephanto div.entry[data-url="' + selector + '"]').css('transition', 'background-color 0.5s');
          $('div#elephanto div.entry[data-url="' + selector + '"]').css('background-color', divBackgroundColor);
        }, 200);
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
        position_list = new Array();
        var i = 0;
        position_has_changed = false;

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
            latest_position_change.time = new Date();
            latest_position_change.selector = position_list[index];
            localStorage.setItem('elephant_position_has_changed', jsonize(latest_position_change));
            displayData();
            highLightNewPosition(position_list[index]);
            return false;
          }
        });
        saveLastPositionList();
      }




      var saveLastPositionList = function() {
        localStorage.setItem('elephant_position_list', jsonize(position_list));
      }
      var getLastPositionList = function() {
        var last_position_list = unjsonize(localStorage.getItem('elephant_position_list'));
        if ($.isArray(last_position_list) == false) {
          last_position_list = new Array();
        }
        return last_position_list;
      }





      //Load external files
      var loadTheme = function() {
        $("head").append($("<link rel='stylesheet' href='" + settings.path + "/themes/" + settings.theme + "/" + settings.theme + ".min.css' type='text/css' media='screen' id='cssTheme' />"));
        /*document.onreadystatechange = function() {
          if (document.readyState === "complete") {
            $('div#elephanto').css('display', 'flex');
          }
        };*/
        $(document).ready(function () {
            $('div#elephanto').css('display', 'flex');
        });
      }
      var loadLang = function() {
        $.ajax({
          url: settings.path + "/lang/" + settings.lang + ".json",
          type: 'json',
          type: 'GET',
          success: function(text) {
            lang = text;
            loadTheme();
            run();
          }
        });
      }





      //RUN
      if (settings.path == "") {
        console.error('You must define your Elephant directory path. Elephant not running...');
        return false;
      } else {
        //Load all externals files before execute the plugin
        loadLang();
      }





      var run = function(){
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
          //loadTheme();
          //loadLang();
          loadElephant();
          computePosition();
          displayData();

          var refreshData = setInterval(function() {
            loadElephant();
            computePosition();
            checkPositionChange();
          }, (settings.refreshRender * 1000));
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



    };


    $.fn.elephantExportHTML = function() {
      var position_list = unjsonize(localStorage.getItem('elephant_position_list'));
      var entry_list = new Array();
      var entry_info = new Array();
      var humanStr = "";

      $.each(position_list, function(index, value) {
        entry_info = unjsonize(localStorage.getItem('elephant::' + value));
        entry_info['url'] = position_list[index];
        entry_list.push(entry_info);
      });

      if(entry_list.length > 0){
        humanStr += "<table border=1 cellpadding=5 style='border:solid 1px black; border-collapse: collapse;'>";
        humanStr += "<caption style='font-weight:bold; text-align:left;'>User Selection Ranking</caption>";
        humanStr += "<thead>";
        humanStr += "<tr>";
        humanStr += "<th>RANK</th>";
        humanStr += "<th>TOTAL SCORE</th>";
        humanStr += "<th>Favorite</th>";
        humanStr += "<th>Visit</th>";
        humanStr += "<th>Time</th>";
        humanStr += "<th>Trigger</th>";
        humanStr += "<th>Scroll</th>";
        humanStr += "<th>Url</th>";
        humanStr += "<th>Last update</th>";
        humanStr += "</tr>";
        humanStr += "</thead>";
        humanStr += "<tbody>";

        $.each(entry_list, function(index, value) {
          humanStr += "<tr>";
          humanStr += "<td style='font-weight:bold;'>#" + (index + 1) + "</td>";
          humanStr += "<td style='font-weight:bold;'>" + value.score + "</td>";
          humanStr += "<td>" + value.favorite + "</td>";
          humanStr += "<td>" + value.visit + "</td>";
          humanStr += "<td>" + value.time + "</td>";
          humanStr += "<td>" + value.trigger + "</td>";
          humanStr += "<td>" + value.scroll + "</td>";
          humanStr += "<td><a href='" + value.url + "' target='_blank'>" + value.url + "</a></td>";
          humanStr += "<td>" + value.updated_at + "</td>";
          humanStr += "</tr>";
        });

        humanStr += "</tbody>";
        humanStr += "</table>";
      }
      return humanStr;

      function unjsonize(data) {
        return jQuery.parseJSON(data);
      }
    }


    $.fn.elephantExportJSON = function() {
      var position_list = unjsonize(localStorage.getItem('elephant_position_list'));
      var entry_list = new Array();
      var entry_info = new Array();
      var jsonArray = new Array();

      $.each(position_list, function(index, value) {
        entry_info = unjsonize(localStorage.getItem('elephant::' + value));
        entry_info_id = unjsonize(localStorage.getItem('elephanto::' + value));
        entry_info['url'] = position_list[index];
        entry_info['id'] = entry_info_id.id;
        entry_list.push(entry_info);
      });

      if(entry_list.length > 0){
        $.each(entry_list, function(index, value) {
          jsonArray[index] = {};
          jsonArray[index].rank = index + 1;
          jsonArray[index].id = value.id;
          jsonArray[index].score = value.score;
          jsonArray[index].favorite = value.favorite;
          jsonArray[index].visit = value.visit;
          jsonArray[index].time = value.time;
          jsonArray[index].trigger = value.trigger;
          jsonArray[index].scroll = value.scroll;
          jsonArray[index].url = value.url;
          jsonArray[index].updated_at = value.updated_at;
        });
      }

      return JSON.stringify(jsonArray);

      function unjsonize(data) {
        return jQuery.parseJSON(data);
      }
    }


  }(jQuery));

});
