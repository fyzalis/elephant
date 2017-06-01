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
        favoriteOffText: "Add to my selection",
        favoriteOnText: "Remove to my selection",
        path: "",
        theme: "default",
        pluginInformation: "Selection made based on your browsing on the site."
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
      var view_state = "visible"; // => Expand, Reduce, visible
      var page = window.location.href;
      var themePath = settings.path + "/themes/" + settings.theme;
      var meta = {
        page: page,
        text: "",
        image: ""
      };

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
        localStorage.setItem('elephant_view', view_state);
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

      var removeEntry = function(entry) {
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
      var listenInfo = function(){
        $('#elephanto div.info img.info').off('click');
        $('#elephanto div.info img.info').on('click', function() {
          alert(settings.pluginInformation);
        });
        $('#elephanto div.info img.clear_elephant').off('click');
        $('#elephanto div.info img.clear_elephant').on('click', function() {
          if(confirm("Do you really reset your selection ?")){
             localStorage.clear();
           }
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
          favorite_block += "<span class='elephant_favorite_off'><img src='"+ themePath + "/favorite-off.png' /></span>";
          favorite_block += "<span class='text'>" + settings.favoriteOffText + "</span>";
          favorite_block += "</div>";

          favorite_block += "<div id='elephant_favorite_on' class='" + favorite_on_class + "'>";
          favorite_block += "<span class='elephant_favorite_on'><img src='"+ themePath + "/favorite-on.png' /></span>";
          favorite_block += "<span class='text'>" + settings.favoriteOnText + "</span>";
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
          $('#elephanto div.list div.entry').css('display', 'flex');
          //$('#elephanto div.info').css('display', 'block');
          view_state = "expand";
        } else if (view_state == "expand") {
          $('#elephanto div.open div.switch_view img.expand').css('display', 'block');
          $('#elephanto div.open div.switch_view img.reduce').css('display', 'none');
          $('#elephanto div.list').toggle();
          //$('#elephanto div.info').css('display', 'none');
          view_state = "reduce";
        } else {
          view_state = "visible";
        }
        localStorage.setItem('elephant_view', view_state);
        return true;
      }



      var displayData = function() {
        if (position_list.length > 0 && (position_has_changed || force_render)) {
          var list = "";
          var cnt = 0;
          var displayed_entries = position_list.length > settings.maxDisplayedResult ? settings.maxDisplayedResult : position_list.length;
          var entry_name = displayed_entries > 1 ? settings.entryName.several : settings.entryName.one;
          var metas = "";
          var stat = "";
          var positionClass = "";
          var favoriteIcon = "";
          force_render = false;
          position_has_changed = false;

          list += "<div class='open'>";
          list += "<div class='logo'><img src='" + themePath + "/logo.png' /></div>";
          list += "<div class='text'>" + settings.title + "<span class='count'>" + displayed_entries + entry_name + "</span></div>";
          list += "<div class='switch_view'>";
          list += "<img class='expand' src='" + themePath + "/open.png' />";
          list += "<img class='reduce' src='" + themePath + "/reduce.png' />";
          list += "</div>";
          list += "</div>";
          list += "<div class='list'>";

          $.each(position_list, function(index, value) {
            if (cnt < settings.maxDisplayedResult) {
              metas = unjsonize(localStorage.getItem('elephanto::' + value));
              stat = unjsonize(localStorage.getItem('elephant::' + value));
              positionClass = cnt == 0 ? 'first' : "";
              favoriteIcon = stat.favorite ? themePath + "/favorite-on.png" : themePath + "/favorite-off.png";
              list += "<div class='entry " + positionClass + "' data-score='" + stat.score + "' data-position='" + cnt + "' data-favorite='" + stat.favorite + "'>";
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
            } else {
              return false;
            }
          });

          list += "</div>";
          list += "<div class='info'>";
          list += "Infos <img class='info' src='" + themePath + "/info.png'>";
          list += "Vider <img class='clear_elephant' src='" + themePath + "/clear.png' />";
          list += "</div>";

          $('#elephanto').html(list);

          if(position_list.length==1){
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
          //$('#elephanto div.info').css('display', 'none');
        } else if (view_state == "expand") {
          $('#elephanto div.list').css('display', 'block');
          $('#elephanto div.list div.entry').css('display', 'flex');
          $("div#elephanto div.open div.switch_view img.reduce").css('display', 'block');
          $("div#elephanto div.open div.switch_view img.expand").css('display', 'none');
          //$('#elephanto div.info').css('display', 'block');
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
        position_list = new Array();
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
        var last_position_list = unjsonize(localStorage.getItem('elephant_position_list'));
        if(typeof last_position_list == 'object'){
          last_position_list = new Array();
        }
        return last_position_list;
      }
      var loadTheme = function() {
        $("head").append($("<link rel='stylesheet' href='" + settings.path + "/themes/" + settings.theme + "/" + settings.theme + ".min.css' type='text/css' media='screen' />"));
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
      if(settings.path == ""){
        console.error('You must define your Elephant directory path. Elephant not running...');
        return false;
      }

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
