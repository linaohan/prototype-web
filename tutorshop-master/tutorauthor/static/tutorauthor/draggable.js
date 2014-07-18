// DJANGO hack to be able to post with CSRF
// using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function createWidget(widget){
    // add widget and save position
    var href = $(location).attr("href");
    var vals = href.split('/');
    interface_id = vals[vals.length - 2];
    $.ajax({
        type: "POST",
        url: "/createWidget/", 
        data: { 
            interface_id: interface_id, 
            value: $(widget).find(".widget")[0].outerHTML, 
            top: $(widget).css('top'), 
            left: $(widget).css('left'), 
            width: $(widget).css('width'), 
            height: $(widget).css('height')},
        success: function(data){
            $(widget).attr('widget-id', data['pk']);
            console.log(data);
        },
    });
}

function updateWidget(widget){
    $.ajax({
        type: "POST",
        url: "/updateWidget/", 
        data: { 
            widget_id: $(widget).attr('widget-id'), 
            value: $(widget).find(".widget")[0].outerHTML, 
            top: $(widget).css('top'), 
            left: $(widget).css('left'),
            width: $(widget).css('width'),
            height: $(widget).css('height'),
			},
        success: function(data){
            console.log(data);
        },
    });
}

function deleteWidget(widget){
    $.ajax({
        type: "POST",
        url: "/deleteWidget/", 
        data: { widget_id: $(widget).attr('widget-id') },
        success: function(data){
            console.log(data);
        },
    });
    $(widget).remove();
}

function makeEditable(event){
    editableText = $("<input/>");
//	editableText.addClass("widget");
    var top=$(this).css('top');
	var left=$(this).css('left');
	var width=$(this).css('width');
    text = $(this).text();
    editableText.val(text);
    $(this).replaceWith(editableText);
    $(editableText).focus();
    $(editableText).change(function(){
        $(this).blur();
    });
    $(editableText).focusout(function(event, ui){

        text = $(this).val();
        uneditableText = $("<span/>");
		originclass=$('.text');
        uneditableText.css("position","relative");
		uneditableText.css("top",top);
		uneditableText.css("left",left);
	    uneditableText.css("width",width);
		uneditableText.css("height",width);
        uneditableText.text(text);
        $(this).replaceWith(uneditableText);

         widget = $(uneditableText).parent();
		 
        $(uneditableText).dblclick(makeEditable);

        updateWidget(widget);
    });
}


    


$(function () {

    // BEGIN DJANGO AJAX
    // Call the functions for the DJANGO, so you can do AJAX
    var csrftoken = getCookie('csrftoken');
	var settings={
	    aspectRatio:1
	};
	
    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    // END DJANGO AJAX

    //Handle existing widgets
    $('.existing-widget > span').dblclick(makeEditable);
  
	//$('.existing-widget').resizable(settings);
    $('.existing-widget').draggable({
        revert: function(event){
            if (!event){
                deleteWidget(this);
            }
            return false;
        }
    });
   

   
 $('.existing-widget ').resizable(
   { 
	   stop: function(event, ui){
       updateWidget(this);
       }
	   
   });
	
//$('#droppable').on('resize', '.existing-widget', function(event, ui) {
 // $(this).resizable('option','aspectRatio',1);
//  var wid=$(this).css('width');
//  var k=parseInt(wid);
//  var ratio=k/100;
//  var font=parseInt($(this).css('font-size'))*ratio/3;
  //console.log($(this));
 // $(this).css("font-size",font);
// });


    //Handle widget palette
    $(".draggable-widget:not(.existing-widget)").draggable({
        helper: "clone",
        revert: function(event){
            return !event; 
        },
    });
	
    $(".nav1").click(function(){
    $("#button").show();
	$("#ios").hide();
	$("#media").hide();
    $("#containers").hide();
	$("#other").hide();
	});
	
	$(".nav2").click(function(){
    $("#button").hide();
	$("#ios").hide();
	$("#media").hide();
    $("#containers").show();
	$("#other").hide();
	});
	
	$(".nav3").click(function(){
    $("#button").hide();
	$("#ios").hide();
	$("#media").show();
    $("#containers").hide();
	$("#other").hide();
	});
	
	$(".nav4").click(function(){
    $("#button").hide();
	$("#ios").show();
	$("#media").hide();
    $("#containers").hide();
	$("#other").hide();
	});
	
	$(".nav5").click(function(){
    $("#button").hide();
	$("#ios").hide();
	$("#media").hide();
    $("#containers").hide();
	$("#other").show();
	});
	
	
	
    // Make canvas droppable
    $("#droppable").droppable({
        drop: function(event, ui) {
            if (!$(ui.draggable).hasClass('existing-widget')){
                widget = $(ui.draggable).clone();
                $(this).append(widget);
                $('#droppable .draggable-widget').addClass('existing-widget');
                $(widget).css('position', 'absolute');
                $(widget).css('top', ui.position.top - $(this).position().top - 13);
                $(widget).css('left', ui.position.left - $(this).position().left - 13);
                $(widget).css('width', 100);
                $(widget).css('height', 100);

                $(widget).find('span').dblclick(makeEditable);
                $(widget).draggable({
                    revert: function(event){
                        if (!event){
                            deleteWidget(this);
                        }
                        return false;
                    }
                });
                $(widget).resizable({
                    stop: function(event, ui){
                        updateWidget(this);
                    }
                });

                createWidget(widget);
            }
            else{
                widget = $(ui.draggable);
                updateWidget(widget);
            }
        }
    });
});


  
  













