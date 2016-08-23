function doSearch() {
		var match_act=document.getElementById("match_act").value;
	    var select_act=document.getElementById("select_act").value;
		var searchstring=document.getElementById("key").value;
		var querytime = new Date()["getTime"]();
		if (searchstring["length"] < 4) {
			alert("关键字长度请大于4!!");
			return false
		};
		hideErrorMessage("#error-container");
        event.preventDefault();
	    var data = buildSearchQuery(match_act,select_act,searchstring);

        $.ajax({
            url: '/ajax.php',
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            crossDomain: true,
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(response) {
				var tableObj = document["getElementById"]("value_tables");
                var source = response.hits.hits;
				var count = response.hits.total;
				var result=[];
                if (count > 0) {
					$("#selecting")["css"]("display", "block");
					$("#somd5_table")["css"]("display", "block");
					if (count >=100) {
						alert("查询到的数据太多，只显示100条，请尽量输入准确的关键词")
						count=100;
					}
                    for (var i = 0; i < count; i++) {
						data=source[i]['_source'];
						result.push('<tr style="height: 27px;">');
						result.push('<td>');
						result.push(data['username']||data['qqnum']||'');
						result.push('</td>');
						result.push('<td>');
						result.push(data['email']||'');
						result.push('</td>');
						result.push('<td>');
						result.push(data['password']||data['passhash']||'');
						result.push('</td>');
						result.push('<td>');
						result.push(data['salt']||'');
						result.push('</td>');
						result.push('<td>');
						result.push(data['type']||'');
						result.push('</td>');
						result.push('</tr>');
					}
					tableObj.innerHTML=result.join('');
					var stend = new Date()["getTime"]() - querytime;
					var rtables = document["getElementById"]("somd5_table");
					var sresult = rtables["rows"]["length"];
					if (sresult == 1) {
						Administry["progress"]("#selecting", 100, 100, "查询完毕!没有搜索到关键字数据 耗时: " + (stend) + "毫秒")
					} else {
						Administry["progress"]("#selecting", 100, 100, "查询完毕! 数据量:" + count + "条 耗时:" + (stend) + "毫秒")
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

function buildSearchQuery(match_act,select_act,searchstring){
	var request = '';
	var must_query = '';
	var select_act=parseInt(select_act);
	var match_act=parseInt(match_act);
    if (match_act==2) {
		switch (select_act) {
			case 1:
				request = {
					query: {
						bool: {
							must: [
								{match: {username: '\"'+searchstring+'\"'}}
							]
						}
					},
					from: 0,
					size: 100
				};
				break;

			case 2:
				request = {
					query: {
						bool: {
							must: [
								{match: {password: '\"'+searchstring+'\"'}}
							]
						}
					},
					from: 0,
					size: 100
				};
				break;

			case 3:
				var username = searchstring;
				var email = searchstring;
				request = {
					query: {
						bool: {
							should: [
								{match: {username: '\"'+searchstring+'\"'}},
								{match: {email: '\"'+searchstring+'\"'}}
							]
						}
					},
					from: 0,
					size: 100
				};
				break;
			case 4:
			request = {
				query: {
					bool: {
						must: [
							{match: {password: '\"'+searchstring+'\"'}}
						]
					}
				},
				from: 0,
				size: 100
			};
			break;
			case 5:
				request = {
					query: {
						bool: {
							must: [
								{match: {qqnum: '\"'+searchstring+'\"'}}
							]
						}
					},
					from: 0,
					size: 100
				};
				break;
		};
	}
	else {
		switch (select_act) {
			case 1:
				request = {
					query: {
						bool: {
							must: [
								{match: {username: searchstring}}
							]
						}
					},
					from: 0,
					size: 100
				};
				break;

			case 2:
				request = {
					query: {
						bool: {
							must: [
								{match: {email: '\"'+searchstring+'\"'}}
							]
						}
					},
					from: 0,
					size: 100
				};
				break;

			case 3:
				request = {
					query: {
						bool: {
							must:[
								{ query_string: {
								default_field: "_all",
								query:'\"'+searchstring+'\"'
								}
								}
							]
						}
					},
					from: 0,
					size: 100
				};
				break;
			case 4:
				request = {
					query: {
						bool: {
							must: [
								{match: {password: '\"'+searchstring+'\"'}}
							]
						}
					},
					from: 0,
					size: 100
				};
				break;
			case 5:
				request = {
					query: {
						bool: {
							must: [
								{match: {qqnum: '\"'+searchstring+'\"'}}
							]
						}
					},
					from: 0,
					size: 100
				};
				break;
		}
	}
	return request;
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
	//$(container).html('');
	$(container).slideUp("fast", function() {});
	//$(container).hide();
}

$(document).ready(function(){
	//Change the icon of the text box as the user types
	$( ".searchfield" ).keyup(function() {
		toggleSearchButton();
	});

	//If button is clicked when there is text in it,
	//clear text and show folders
	$(".input-group-addon").on('click', function (e) {
		if ($('.searchfield').val()) {
			$('.searchfield').val("");
			toggleSearchButton();
		}
	});

	//Process the search
	$("form").on("submit", function(event){
		if ($('.searchfield').val()) {
			doSearch($('.searchfield').val());
		}else{
			return false;
		}
	});

});

//Function toggles between the search results and the folders structure
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