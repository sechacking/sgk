function getdata() {
        $("#spinny").show();

        $("#resultsHeader").hide();
				hideErrorMessage("#error-container");

        event.preventDefault();

        $("#results").empty();

				var folder_selected =  $("#folders").val();

				var data = buildSearchQuery(folder_selected, searchstring);

        $.ajax({
            url: '/search.php',
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            crossDomain: true,
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(response) {

                $("#spinny").hide();

                var data = response.hits.hits;
                var doc_ids = [];
                var source = null;
                var content = '';

                if (data.length > 0) {
                    $("#resultsHeader").html(data.length + " Results").show();
                    for (var i = 0; i < data.length; i++) {

                        source = data[i].fields;

                    }

                } else {
						showErrorMessage("#error-container", "<strong>Ooops!</strong> No results found! Please try again.","alert-danger", true, 3000);
                }

            },
            error: function(jqXHR, textStatus, errorThrown) {
                var jso = jQuery.parseJSON(jqXHR.responseText);
                error_note('section', 'error', '(' + jqXHR.status + ') ' + errorThrown + ' --<br />' + jso.error);
            }
        });
}


function buildSearchQuery(folder, searchstring){
	var response = '';
	var real_folder = folder+"/";
	var must_query = '';
	if(folder==0){
		response = {
			query: {
				bool: {
					must:[
						{ match: { _all: searchstring }}
					]
				}
			},
			fields : ["username", "password", "passhash","email"],
			size : 1000,
			highlight : {
				"fields" : {
					"content" : {}
				}
			}
		};
	}else{
		response = {
			query: {
				bool: {
					must:[
						{ match: { _all: searchstring }},
						{ match: { "password": real_folder }}
					]
				}
			},
			fields : ["username", "password", "passhash","email"],
			size : 1000,
			highlight : {
				"fields" : {
					"content" : {}
				}
			}
		};
	}
	console.log("Json is "+JSON.stringify(response));
	return response;
}

function showErrorMessage(container, message, type, auto_hide, hide_timeout){
	var error_box = '<div class="alert '+type+' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+message+'</div>';
	$(container).html(error_box);
	$(container).hide();
	$(container).slideDown("fast", function() {});

	if(auto_hide){
		$(container).delay(hide_timeout).fadeOut('slow');
	}
}

function hideErrorMessage(container){
	$(container).slideUp("fast", function() {});
}

$(document).ready(function(){
	$( ".searchfield" ).keyup(function() {
		toggleSearchButton();
	});
	$(".input-group-addon").on('click', function (e) {
		if ($('.searchfield').val()) {
			$('.searchfield').val("");
			toggleSearchButton();
		}
	});
	$("form").on("submit", function(event){
		if ($('.searchfield').val()) {
			doSearch($('.searchfield').val());
		}else{
			return false;
		}
	});

});

function toggleSearchButton(){
	if ($('.searchfield').val()) {
		//Change the icon to show the cross instead of the search icon
		$('#textbox-icon').removeClass('fa fa-search').addClass('fa fa-times');
		//hide the documents tree
		//$('#jstree').fadeOut( "slow", function() {});
	}else{
		$('#results').html('');
		//Change the icon to show the search instead of the cross
		$('#textbox-icon').removeClass('fa fa-times').addClass('fa fa-search');
		//hide the documents tree
		//$('#jstree').fadeIn( "slow", function() {});
	}
}