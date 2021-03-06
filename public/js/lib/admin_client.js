$(function() {
  var
    TIMEOUT = 3 * 1000,
    PAUSE = 1 * 1000,

    since = -10,

    $status = $('#status'),
    $messages = $('#messages'),
    updateUrl = [
      'http://',
      window.location.hostname,
      ':',
      8013,
      '/messages'
    ].join('');
     
    pollUrl = [
      'http://',
      window.location.hostname,
      ':',
      8014,
      '/messages'
    ].join('');

  function do_update(pId,pAction) {

    var id = pId, action = pAction;
    var start = +new Date;
    $.ajax({
      url: updateUrl,
      data: {_id: id, action: action},
      dataType: 'jsonp',
      success: function(response) {
        // var duration = (+new Date - start);
        $("#admin-notes").text('I WANT TO CHANGE THE TEXT IN THE ITEMS SPAM/THINGY');
      },
      error:function (xhr, ajaxOptions, thrownError){
        alert(thrownError);
      }
    });
    return false;
  }
  
  function poll() {
    var
      url = pollUrl+'?since='+since+'&admin=1';

    $status.text('Polling '+url+' ...');

    $.jsonp({
      url: url,
      callbackParameter: 'callback',
      timeout: TIMEOUT,
      error: function(xOptions, status) {
        if (status != 'timeout') {
          $status.text('JSONP error: '+status);
        } else {
          $status.text('Timeout, re-connect in '+PAUSE+' ms');
        }

        // Wait for PAUSE ms before re-connecting
        setTimeout(function() {
          poll();
        }, PAUSE);
      },
      success: function(r) {
        // Remember were we left off
        since = r.seq;

        $status.text('Fetched '+r.messages.length+' messages, re-connect in '+PAUSE+' ms');

        if ($('#messages').children().length == 0) {
          // Show the new messages
          $.each(r.messages, function() {
            /*
            This adds an LI element with simple text in. 
            Desire:
            * Add a link to approve/remove objects from the database live
            * In some manner make this unbreakable...(ha)
            */
            $messages.append(
              $('<tr/>')
                .append( $("<td id="+this._id+"/>").text(this.message) )
                .append( $("<td/>").prepend("<a href='#publish/"+this._id+"' id='"+this._id+"' class='publish'>publish...</a>") )
                .append( $("<td/>").prepend("<a href='#spammize/"+this._id+"' id='"+this._id+"' class='spammit'>spam</a>") )
              );
            });          
        } else {
          // Show the new messages
          $.each(r.messages, function() {
            /*
            This adds an LI element with simple text in. 
            Desire:
            * Add a link to approve/remove objects from the database live
            * In some manner make this unbreakable...(ha)
            */
            $messages.prepend(
              $('<tr/>')
                .append( $("<td id="+this._id+"/>").text(this.message))
                .append( $("<td/>").prepend("<a href='#publish/"+this._id+"' id='"+this._id+"' class='publish'>publish...</a>"))
                .append( $("<td/>").prepend("<a href='#spammize/"+this._id+"' id='"+this._id+"' class='spammit'>spam</a>")
                )
              );
            });          
        }

        // Wait for PAUSE ms before re-connecting
        setTimeout(function() {
          poll();
        }, PAUSE);
      }
    })
  }

  poll();
  
  
  // var $status = $("#status");

     $(".spammit").livequery('click', function(){
       message = $(this).parent().prev().text();
       $("#admin-notes").text("Sending a 'spam' flag for the message: " + message);
       mark_as("spam", this);
       return false
     });

     $(".publish").livequery('click', function(){
       message = $(this).parent().prev().text();
       $("#admin-notes").text("Publishing the message: " + message);
       mark_as("published", this);
       return false
     });

     function get_status(item, action) {
       //This should probably return a spinning progress icon until the transaction is completed, we'll use the TD hook that contains this to do that with ajax:success
       if(action) {
         do_update(id, action);
       } else {
         return "fail"
       }
     }

     function get_options(item) {
       // return 123;
       return ($("<span class='text-divider'/>").text(" | "))
         .prepend($("<a href='#restore' />").text("Restore"))
         .append($("<a href='#ban' />").text("Ban user")
       )
     }
     
    function mark_as(action, item) {
      // .hide("slow");
      id = $(item).attr("id");
      tr =  $("<tr id='"+id+"'/>")
        .append( $("<td/>").text($(item).parent().prev().text()) )
        .append( $("<td/>").text(id) )
        .append( $("<td class='status'/>").text(get_status(id, action)) )
        .append( $("<td class='options'/>").append(get_options(item))
      );
      if (action=="spam") {
        target = "#spammed_messages";
      } else if (action=="published") {
        target = "#published_messages";
      }

      $(target).append(tr);

      $(item).parent().parent().hide("dissolve");


       // $("#trashed_messages").append($(item).parent().parent().hide("slow"));//$(item)).reveal("slow");
     }

});
