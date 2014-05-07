//create array of all song titles
var songTitles=[], songArtists=[], songFiles=[], plistElements="", currentAudio=0;

for (item in audioFiles) {
	songTitles.push(audioFiles[item].songTitle);
	songArtists.push(audioFiles[item].artistName);
	songFiles.push(audioFiles[item].fileNames);
}

//create string of backgrounds and text treatments for song titles and artists
for (item in songTitles) {
	var listBG;
	(item%2==0) ? (listBG="field-even") : (listBG="field-odd");
	plistElements = plistElements +'<div class="' +listBG+ '"><img class="hideImage" src="assets/images/musicPlaylist_playingIcon.png">' +songTitles[item]+'</div>\
	';
}

$Playlist=$('.audioPlaylist');
if (!!document.createElement('audio').canPlayType){
	buildPlaylist($Playlist);
}

function buildPlaylist(file) {
	var player = '<div class="playerContainer">\
					<div class="upperContainer">\
						<div class="playlistContainer">\
							<div class="songFields">\
							'+plistElements+'\
							</div>\
						</div>\
					</div>\
					<div class="playerDragArea">\
						<span class="musicPlayer-songControls">\
							<span class="musicPlayer-gutter">\
								<span class="musicPlayer-handle"></span>\
								<span class="musicPlayer-gutterPlayed"></span>\
								<span class="musicPlayer-gutterLoaded"></span>\
								<span class="musicPlayer-gutterTotal"></span>\
							</span>\
						</span>\
						<span class="musicPlayer-timeElapsed musicPlayer-timeStyle">0:00</span>\
						<span class="musicPlayer-timeTotal musicPlayer-timeStyle">0:00</span>\
						<div class="controlContainer">\
							<div class="playlist-PrevButton"><img src="assets/images/musicPlaylist_prevButton.png" alt=""></div>\
							<div class="playlist-PlayButton"><img src="assets/images/musicPlaylist_playButton.png" alt=""></div>\
							<div class="playlist-NextButton"><img src="assets/images/musicPlaylist_nextButton.png" alt=""></div>\
						</div>\
					</div>\
				</div>\
				<audio id="plstPlayer" src="assets/'+songFiles[0]+'"></audio>\
	',
	audio,
	lodingIndicator,
	positionIndicator,
	playedIndicator,
	gutter,
	timeElapsed,
	timeTotal,
	manualSeek=false;
	$Playlist.append(player);

	//creating variables for jQuery objects
	//#Player'+iter+' 
	audio=$('audio');
	lodingIndicator=$('.musicPlayer-gutterLoaded');
	positionIndicator=$('.musicPlayer-handle');
	playedIndicator=$('.musicPlayer-gutterPlayed');
	timeElapsed=$('.musicPlayer-timeElapsed');
	playtoggle=$('.playlist-PlayButton');
	timeTotal=$('.musicPlayer-timeTotal');
	gutter=$('.musicPlayer-gutterTotal');
	$playlistContainer=$(".playlistContainer");
	$songFields=$(".songFields");
	songFieldsArr=$songFields.children();

	//Add "playing" indicator to first song
	$(songFieldsArr[0]).addClass("field-selected");
	//$(songFieldsArr[0]).children("img").removeClass('hideImage');

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
  		playbutton=$(this).siblings('.playerContainer').find('.playlist-PlayButton').children('img');
  		playbutton.attr('src', 'assets/images/musicPlaylist_pauseButton.png');		
	}).bind('pause ended', function() {
		playbutton.attr('src', 'assets/images/musicPlaylist_playButton.png');		
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

	$(audio.get(0)).on('ended', function(){
		$this=$(this);
		if (currentAudio==(songFiles.length-1)){
			$this.attr('src', 'assets/'+songFiles[0]);
			$(songFieldsArr[currentAudio]).removeClass('field-selected');
			//$(songFieldsArr[currentAudio]).children("img").addClass('hideImage');
			currentAudio=0;
			$(songFieldsArr[currentAudio]).addClass('field-selected');
			//$(songFieldsArr[currentAudio]).children("img").removeClass('hideImage');
			$this.load();
			this.play();
		} else {
			$this.attr('src', 'assets/'+songFiles[currentAudio+1]);
			$(songFieldsArr[currentAudio]).removeClass('field-selected');
			//$(songFieldsArr[currentAudio]).children("img").addClass('hideImage');
			currentAudio+=1;
			$(songFieldsArr[currentAudio]).addClass('field-selected');
			//$(songFieldsArr[currentAudio]).children("img").removeClass('hideImage');
			$this.load();
			this.play();
		}
		adjustScreen(currentAudio);
	});
	
	$(songFieldsArr).on("click", function(){
		$song=jQuery.inArray(this, songFieldsArr);
		aud=audio.get(0);
		$aud=$(aud);
		$aud.attr('src', 'assets/'+songFiles[$song]);
		$(songFieldsArr[currentAudio]).removeClass('field-selected');
		$(this).addClass('field-selected');
		currentAudio=$song;
		$aud.load();
		aud.play();


		
	});
	
}

function adjustScreen(current){
	compHeight=$(songFieldsArr[current]).outerHeight();
	if (compHeight*current>=$songFields.height()){
		scr=$playlistContainer.scrollTop()+36;
  		//console.log(scr);  		
  		$playlistContainer.scrollTop(scr);
	}
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
