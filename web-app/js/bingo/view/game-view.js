var bingo = bingo || {};
bingo.view = bingo.view || {};

bingo.view.gameview = function (model, elements) {

    var that = grails.mobile.mvc.view(model, elements);

    // Register events
    that.model.listedItems.attach(function (data) {
        $('#list-game').empty();
        var key, items = model.getItems();
        $.each(items, function(key, value) {
            renderElement(value);
        });
        $('#list-game').listview('refresh');
    });

    that.model.createdItem.attach(function (data, event) {
        if (data.item.errors) {
            $.each(data.item.errors, function(index, error) {
                $('#input-game-' + error.field).validationEngine('showPrompt',error.message, 'fail');
            });
            event.stopPropagation();
        } else if (data.item.message) {
            showGeneralMessage(data, event);
        } else {
            renderElement(data.item);
            $('#list-game').listview('refresh');
            // Bingo: start
            if (!data.item.NOTIFIED) {
                that.gameId = data.item.id;
                that.board = data.item.board;

                $.mobile.changePage($("#section-show-game"), {data: {hideSave:true}});
                $('#submit-game').hide();
                initBoard(that.board);
            } else {
                $.mobile.changePage($('#section-list-game'));
            }
            // Bingo: end

		}
    });

    var initBoard = function(board) {
        // Reset HTML grid
        $("#grid").empty();
        that.parsedBoard = JSON.parse(board);

        // Populate HTML grid with randomly fed card
        var out = '';
        var line = 0;
        for (var i = 0 ; i <that.parsedBoard.length; i++) {
            var modulo = i%5;
            if (modulo == 0) {
                line++;
            }
            var charTheme = String.fromCharCode(97 + modulo);
            out = out + '<div id="item_' + i + '" class="line-'+ line +' ui-block-'+ charTheme +'"><div class="ui-bar ui-bar-e" style="padding: .4em 2px;text-align : left;height:50px"><br>'+ that.parsedBoard[i].label+'</div></div>';
        };
        $("#grid").append(out);

        // Add event to each cell of grid
        for (var i = 0 ; i <that.parsedBoard.length; i++) {
            var selector = "#item_" + i + " div";
                $(selector).on("click", null, {scope: that, index: i}, that.selectItem);
        };
    };


    that.selectItem = function(event) {
        var isSelected = event.data.scope.parsedBoard[event.data.index].selected;
        if (isSelected) {
            event.data.scope.parsedBoard[event.data.index].selected = false;
            $(this).removeClass('ui-bar-b').addClass('ui-bar-e');
        } else {
            event.data.scope.parsedBoard[event.data.index].selected = true;
            $(this).removeClass('ui-bar-e').addClass('ui-bar-b');
        }
        var displayPopup = areYouAboutToYellBullShit();
    };

    var areYouAboutToYellBullShit = function() {
        var isFirstColum = $("div[class*='ui-block-a'] div[class*='ui-bar-b']").length==5;
        var isSecondColum = $("div[class*='ui-block-b'] div[class*='ui-bar-b']").length==5;
        var isThirdColum = $("div[class*='ui-block-c'] div[class*='ui-bar-b']").length==5;
        var isFourthColum = $("div[class*='ui-block-d'] div[class*='ui-bar-b']").length==5;
        var isFifthColum = $("div[class*='ui-block-e'] div[class*='ui-bar-b']").length==5;

        var isFirstLine = $("div[class*='line-1'] div[class*='ui-bar-b']").length==5;
        var isSecondLine = $("div[class*='line-2'] div[class*='ui-bar-b']").length==5;
        var isThirdLine = $("div[class*='line-3'] div[class*='ui-bar-b']").length==5;
        var isFourthLine = $("div[class*='line-4'] div[class*='ui-bar-b']").length==5;
        var isFifthLine = $("div[class*='line-5'] div[class*='ui-bar-b']").length==5;

        if(isFifthColum || isFourthColum || isThirdColum || isSecondColum || isFirstColum
            || isFifthLine || isFourthLine || isThirdLine || isSecondLine || isFirstLine) {
            $("#bingoDialog").click();
            if (that.gameId){
                that.deleteButtonClicked.notify({ id: that.gameId, playerName: that.playerName });
            }
        }

        return false;
    };

    that.model.updatedItem.attach(function (data, event) {
        if (data.item.errors) {
            $.each(data.item.errors, function(index, error) {
                $('#input-game-' + error.field).validationEngine('showPrompt',error.message, 'fail');
            });
            event.stopPropagation();
        } else if (data.item.message) {
            showGeneralMessage(data, event);
        } else {
            updateElement(data.item);
            $('#list-game').listview('refresh');
            $.mobile.changePage($('#section-list-game'));
        }
    });

    that.model.deletedItem.attach(function (data, event) {
        if (data.item.message) {
            showGeneralMessage(data, event);
        } else {
            $('#game-list-' + data.item.id).parents('li').remove();
            $('#list-game').listview('refresh');
            if (that.playerName != data.item.playerName) {
                $('#winner').append('<h3>The Winner is <b>' + data.item.playerName + '</b></h3>');
                $('#bingoLost').click();
            }
            that.gameId = null;
        }
    });

    // user interface actions
    $('#play').live('click tap', function (event) {
        if (!that.playerName) {
            $.mobile.changePage($('#ask-name'), {role:'dialog', transition:'flip'});
        } else {
            $.mobile.changePage($('#section-list-game'));
        }
    });

    $('#save-name').live('click tap', function (event) {
        that.playerName = $('#input-your-name').val();
        $.mobile.changePage($('#section-list-game'));
    });

    that.elements.list.live('pageinit', function (e) {
        that.listButtonClicked.notify();
    });

    that.elements.save.live('click tap', function (event) {
        event.stopPropagation();
        $('#form-update-game').validationEngine('hide');
        if($('#form-update-game').validationEngine('validate')) {
            var obj = grails.mobile.helper.toObject($('#form-update-game').find('input, select'));
            var newElement = {
                game: JSON.stringify(obj)
            };
            if (obj.id === '') {
                that.createButtonClicked.notify(newElement, event);
            } else {
                that.updateButtonClicked.notify(newElement, event);
            }
        }
    });

    that.elements.remove.live('click tap', function (event) {
        event.stopPropagation();
        that.deleteButtonClicked.notify({ id: $('#input-game-id').val()}, event);
    });

    that.elements.add.live('click tap', function (event) {
        event.stopPropagation();
        $('#form-update-game').validationEngine('hide');
        $('#form-update-game').validationEngine({promptPosition: 'bottomLeft'});
        createElement();
    });

    that.elements.show.live('click tap', function (event) {
        event.stopPropagation();
        that.gameId = $(event.currentTarget).attr("data-id");
        showElement(that.gameId);
        that.board = model.getItems()[that.gameId].board;
        initBoard(that.board);
        $('#submit-game').hide();
    });

    var createElement = function () {
        resetForm('form-update-game');
        $('#submit-game').show();
        $.mobile.changePage($('#section-show-game'));
    };

    var showElement = function (id) {
        resetForm('form-update-game');
        var element = that.model.items[id];
        $.each(element, function (name, value) {
            var input = $('#input-game-' + name);
            input.val(value);
            if (input.attr('data-type') == 'date') {
                input.scroller('setDate', (value === '') ? '' : new Date(value), true);
            }
        });
        $('#submit-game').show();
        $.mobile.changePage($('#section-show-game'));
    };

    var resetForm = function (form) {
        $("#grid").empty();
        $('input[data-type="date"]').each(function() {
            $(this).scroller('destroy').scroller({
                preset: 'date',
                theme: 'default',
                display: 'modal',
                mode: 'scroller',
                dateOrder: 'mmD ddyy'
            });
        });
        var div = $("#" + form);
        div.find('input:text, input:hidden, input[type="number"], input:file, input:password').val('');
        div.find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');
    };
    
    var createListItem = function (element) {
        var li, a = $('<a>');
        a.attr({
            id : 'game-list-' + element.id,
            'data-id' : element.id,
            'data-transition': 'fade'
        });
        a.text(element.meetingName);
        if (element.offlineStatus === 'NOT-SYNC') {
            li =  $('<li>').attr({'data-theme': 'e'});
            li.append(a);
        } else {
            li = $('<li>').append(a);
        }
        return li;
    };

    var renderElement = function (element) {
        if (element.offlineAction !== 'DELETED') {
            $('#list-game').append(createListItem(element));
        }
    };

    var updateElement = function (element) {
        $('#game-list-' + element.id).parents('li').replaceWith(createListItem(element));
    };

    var getText = function (data) {
        var textDisplay = '';
        $.each(data, function (name, value) {
            if (name !== 'class' && name !== 'id' && name !== 'offlineAction' && name !== 'offlineStatus' && name !== 'status' && name !== 'version') {
                if (typeof value !== 'object') {   // do not display relation in list view
                    textDisplay += value + ' - ';
                }
            }
        });
        return textDisplay.substring(0, textDisplay.length - 2);
    };

    var showGeneralMessage = function(data, event) {
        $.mobile.showPageLoadingMsg( $.mobile.pageLoadErrorMessageTheme, data.item.message, true );
        setTimeout( $.mobile.hidePageLoadingMsg, 3000 );
        event.stopPropagation();
    };

    return that;
};