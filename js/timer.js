window.addEventListener('DOMContentLoaded', function() {
    var $startButton = document.querySelector('#start');
    var $pauseButton = document.querySelector('#pause');
    var $stopButton = document.querySelector('#stop');
    var $p1Button = document.querySelector('#p1');
    var $m1Button = document.querySelector('#m1');

    $pauseButton.style.display = 'none';
    $stopButton.style.display = 'none';
    $p1Button.style.display = 'none';
    $m1Button.style.display = 'none';

    var $info = document.querySelector('#info');

    var soundTable = [60, 30, 15, 5, 0];
    var $sounds = [];
    for (var i = 0, n = soundTable.length; i < n; i++) {
        $sounds.push(document.querySelector('#sound' + soundTable[i]));
    }

    var Timer = function() {
        this.time = 0;
        this.isRunning = false;
        this.startTime = 0;
        this.timerId = 0;

        this.timeTable = [420, 920, 1210, 1420, 1600, 1730, 1850, 1940, 2150, 2165];
        this.timeTableIndex = 0;
        this.soundIndex = 0;
        this.timerId = window.setInterval(this.loop.bind(this), 100);
    }
    Timer.prototype.loop = function() {
        if (!this.isRunning) {
            return;
        }
        var now = new Date().getTime();
        var time = Math.floor((this.time + now - this.startTime) / 1000);

        var timeTable = this.timeTable[this.timeTableIndex];

        if (timeTable - soundTable[this.soundIndex] <= time) {
            $sounds[this.soundIndex].volume = 0.5;
            $sounds[this.soundIndex].play();
            this.soundIndex++;
            if (this.soundIndex >= soundTable.length) {
                this.timeTableIndex++;
                this.soundIndex = 0;
            }
        }
        $info.innerHTML = timeTable - time;
    }
    Timer.prototype.start = function() {
        this.startTime = new Date().getTime();
        this.isRunning = true;
        $startButton.style.display = 'none';
        $pauseButton.style.display = 'inline';
        $stopButton.style.display = 'inline';
        $p1Button.style.display = 'inline';
        $m1Button.style.display = 'inline';
    }
    Timer.prototype.pause = function() {
        this.isRunning = false;
        var now = new Date().getTime();
        this.time = this.time + now - this.startTime;
        $startButton.style.display = 'inline';
        $pauseButton.style.display = 'none';
        $stopButton.style.display = 'none';
        $p1Button.style.display = 'none';
        $m1Button.style.display = 'none';
    }
    Timer.prototype.stop = function() {
        this.time = 0;
        this.isRunning = false;
        this.startTime = 0;
        this.timerId = 0;
        this.timeTableIndex = 0;
        $startButton.style.display = 'inline';
        $pauseButton.style.display = 'none';
        $stopButton.style.display = 'none';
        $p1Button.style.display = 'none';
        $m1Button.style.display = 'none';
        $info.innerHTML = '--';
    }
    var timer = new Timer();

    $startButton.addEventListener('click', function() {
        timer.start();
    });
    $pauseButton.addEventListener('click', function() {
        timer.pause();
    });
    $stopButton.addEventListener('click', function() {
        timer.stop();
    });
    $m1Button.addEventListener('click', function() {
        timer.time += 1000;
    });
    $p1Button.addEventListener('click', function() {
        timer.time -= 1000;
    });
}, false);