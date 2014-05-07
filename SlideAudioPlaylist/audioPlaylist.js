/*
playtoggle=play/pause button
gutter=the timeline track
loading=the bar indicating loading or buffering progress
handle=draggable playhead element
timeleft=play time remaining
*/
/*Each version of the audio (.mp3, .ogg, .wav) will need to have the same file name. Then, add the name for each audio segment as a string to the array below minus any file extension*/
//var audiofiles=["01 Twilight Of The Thunder God","02 Caught In A Mosh"],
console.log(audioFiles[1].songTitle);

$Player=$('.audioPlayers');		
if (!!document.createElement('audio').canPlayType){
	for (var i=0; i<audioFiles.length; i++){
		buildPlayer(audioFiles[i],i);
	}
}

function buildPlayer(file, iter){
	var player = '<div class="musicPlayer-holder" id="Player'+iter+'">\
			<p class="musicPlayer">\
				<span class="musicPlayer-playtoggle"></span>\
				<span class="musicPlayer-songTitle">'+file.songTitle+'</span>\
				<span class="musicPlayer-artistName">'+file.artistName+'</span>\
				<span class="musicPlayer-songControls">\
					<span class="musicPlayer-timeElapsed musicPlayer-timeStyle">0:00</span>\
					<span>/</span>\
					<span class="musicPlayer-timeTotal musicPlayer-timeStyle">0:00</span>\
					<span class="musicPlayer-gutter">\
						<span class="musicPlayer-handle"></span>\
						<span class="musicPlayer-gutterPlayed"></span>\
						<span class="musicPlayer-gutterLoaded"></span>\
						<span class="musicPlayer-gutterTotal"></span>\
					</span>\
				</span>\
			</p>\
    		<audio '+/*'controls'*/+' id="audio_'+iter+'">\
      			<source src="assets/'+file.fileNames+'" type="audio/mpeg"></source>\ '+
      			//<source src="assets/'+file.fileNames[1]+'" type="audio/ogg"></source>\
      			//<source src="assets/'+file.fileNames[2]+'" type="audio/x-wav"></source>\
    		'</audio>\
    	</div>',
    	audio,
    	lodingIndicator,
		positionIndicator,
		playedIndicator,
		gutter,
		timeElapsed,
		timeTotal,
		manualSeek=false;   	
  	$($Player[i]).append($(player));

	//creating variables for jQuery objects
	audio=$('#Player'+iter+' audio');
	lodingIndicator=$('#Player'+iter+' .musicPlayer-gutterLoaded');
	positionIndicator=$('#Player'+iter+' .musicPlayer-handle');
	playedIndicator=$('#Player'+iter+' .musicPlayer-gutterPlayed')
	timeElapsed=$('#Player'+iter+' .musicPlayer-timeElapsed');
	playtoggle=$('#Player'+iter+' .musicPlayer-playtoggle');
	timeTotal=$('#Player'+iter+' .musicPlayer-timeTotal');
	gutter=$('#Player'+iter+' .musicPlayer-gutterTotal');

	//setting up the loading bar
	audio.on('loadstart', function(e){
		audio.on('progress', function(){
			var loaded = ((this.buffered.end(0)/this.duration));
			var pOfGutter=gutter.width()*loaded.toFixed(2);
			lodingIndicator.css({width: pOfGutter + "px"});
		});
	})
	
	audio.on('timeupdate', function(){
		var elapsed=parseInt(this.currentTime),
			totalMin=Math.floor(this.duration/60,10),
			totalSec=Math.floor(this.duration-totalMin*60),
			totalTime=totalMin+":"+(totalSec > 9 ? totalSec : "0"+totalSec),
			pos=((this.currentTime/this.duration)*97),
			mins=Math.floor(elapsed/60,10),
			secs=elapsed-mins*60;
		timeElapsed.text(mins+":"+(secs > 9 ? secs : "0" + secs));
		timeTotal.text(totalTime);
		if (!manualSeek){ 
			positionIndicator.css({left: pos + '%'});
			playedIndicator.css({width: positionIndicator.position().left + "px"});
		}
	});

	positionIndicator.on(' touchdown vmousedown ', function (event) {
		manualSeek=true;
		$this=$(this);
		var parentOffset=$this.parent().offset();
		mouseDownX=event.pageX-$this.offset().left;
		$target=$(event.target);
		$duration=audio.get(0).duration;
		$parentOffset=$target.parent().offset().left;
		$parentWidth=$target.parent().width();
		$targetWidth=$target.width();
		audio.get(0).pause();
		audio.get(0).paused=true;
		$("body").on(' touchmove vmousemove ', function(event){ movingHandle(event,audio)});
		$("body").on(' touchup vmouseup', function(event){
			$("body").off(' touchmove vmousemove ');
			manualSeek=false;
		})
	});

	audio.bind('play',function() {
  		playbutton=$(this).siblings('.musicPlayer').find('.musicPlayer-playtoggle');
  		playbutton.addClass('musicPlayer-playing');		
	}).bind('pause ended', function() {
		playbutton.removeClass('musicPlayer-playing');		
	});		
	playtoggle.on('click', function() {			
  		var aud=audio.get(0);
  		if (aud.paused) { 
  			aud.play();
  			aud.paused=false;
  		} else { 
  			aud.pause();
  			aud.paused=true;
  		}			
	});

	audio.get(0).volume=0.25;
}

function seekingTrack(audio){
		//attach position of handle to position in song/timer while moving
		currentTimeLocation=((parseInt($target.css('left'))/($parentWidth-$target.width()))*$duration);
		audio.get(0).currentTime=currentTimeLocation;
	}

	//function for setting position of slider and music 
function movingHandle(event, audio){
	$target.css({left: (event.pageX)-$parentOffset-mouseDownX});
	if ($target.offset().left >= $parentOffset+$parentWidth-$targetWidth) {
		$target.css({left: ($parentWidth-$targetWidth)});
	} else if ($target.offset().left<$parentOffset) {
		$target.css({left: 0});
	}
	$target.parent().find('.musicPlayer-gutterPlayed').css({width: parseInt($target.css("left"))+5});		
	seekingTrack(audio);
}