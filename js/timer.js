window.addEventListener('DOMContentLoaded', function() {
    var $startInputArea = document.querySelector('#startInputArea');
    var $startInput = document.querySelector('#startInput');
    var $startButton = document.querySelector('#start');
    var $stopButton = document.querySelector('#stop');
    var $p1Button = document.querySelector('#p1');
    var $m1Button = document.querySelector('#m1');

    function hideStartButton() {
        $startButton.style.display = 'none';
        $startInputArea.style.display = 'none';
        $stopButton.style.display = 'inline';
        $p1Button.style.display = 'inline';
        $m1Button.style.display = 'inline';
    }
    function showStartButton() {
        $startButton.style.display = 'inline';
        $startInputArea.style.display = 'inline';
        $stopButton.style.display = 'none';
        $p1Button.style.display = 'none';
        $m1Button.style.display = 'none';
    }
    showStartButton();

    var $info = document.querySelector('#info');

    var soundTable = [60, 30, 15, 5, 0];
    var $sounds = [];
    for (var i = 0, n = soundTable.length; i < n; i++) {
        $sounds.push(document.querySelector('#sound' + soundTable[i]));
    }
    var $soundStart = document.querySelector('#soundstart');
    var $soundEnd = document.querySelector('#soundend');

    var volume = localStorage.getItem('pubgtimer_volume') / 100 || 0.5;
    var $volume = document.querySelector('#volume');
    $volume.addEventListener('change', function() {
        volume = this.value / 100;
        localStorage.setItem('pubgtimer_volume', this.value);
    });
    $volume.value = volume * 100;

    var Timer = function() {
        this.time = 0;
        this.isRunning = false;
        this.startTime = 0;
        this.timerId = 0;

        this.START = 0;
        this.NORMAL = 1;
        this.END = 2;
        this.MARGIN = 3;

        this.timeTable = [
            {time: 0, type: this.START}, {time: 120, type: this.END},
            {time: 420, type: this.NORMAL}, {time: 720, type: this.END},
            {time: 920, type: this.NORMAL}, {time: 1060, type: this.END},
            {time: 1210, type: this.NORMAL}, {time: 1300, type: this.END},
            {time: 1420, type: this.NORMAL}, {time: 1480, type: this.END},
            {time: 1600, type: this.NORMAL}, {time: 1640, type: this.END},
            {time: 1730, type: this.NORMAL}, {time: 1760, type: this.END},
            {time: 1850, type: this.NORMAL}, {time: 1880, type: this.END},
            {time: 1940, type: this.NORMAL}, {time: 1955, type: this.END},
            {time: 2150, type: this.NORMAL}, {time: 2165, type: this.END}
        ];
        this.timeTableIndex = 0;
        this.soundIndex = 0;
        this.timerId = window.setInterval(this.loop.bind(this), 100);
    }
    Timer.prototype.loop = function() {
        if (!this.isRunning) {
            return;
        }
        var rest;
        var now = new Date().getTime();
        var time = Math.floor((this.time + now - this.startTime) / 1000);

        var timeTable = this.timeTable[this.timeTableIndex];

        var infoPrefix = '';
        switch(timeTable.type) {
            case this.START:
                infoPrefix = 'マッチ開始まで';
                if (timeTable.time <= time) {
                    $soundStart.volume = volume;
                    $soundStart.play();
                    this.timeTableIndex++;
                }
                rest = timeTable.time - time - 3;
                rest = rest < 0 ? 0 : rest;
                break;
            case this.NORMAL:
                infoPrefix = '範囲収縮まで';
                if (timeTable.time - soundTable[this.soundIndex] <= time) {
                    $soundEnd.pause();
                    $sounds[this.soundIndex].volume = volume;
                    $sounds[this.soundIndex].play();
                    this.soundIndex++;
                    if (this.soundIndex >= soundTable.length) {
                        this.timeTableIndex++;
                        this.soundIndex = 0;
                        if (this.timeTableIndex >= this.timeTable.length) {
                            this.stop();
                        }
                    }
                }
                rest = timeTable.time - time;
                break;
            case this.END:
                infoPrefix = '次エリア決定まで';
                if (timeTable.time <= time) {
                    $soundEnd.volume = volume;
                    $soundEnd.play();
                    this.timeTableIndex++;
                }
                rest = timeTable.time - time;
                break;
        }

        $info.innerHTML = infoPrefix + Math.floor(rest / 60) + '分' + rest % 60 + '秒';
    }
    Timer.prototype.start = function() {
        this.startTime = new Date().getTime();
        this.isRunning = true;
        hideStartButton();
    }
    Timer.prototype.pause = function() {
        this.isRunning = false;
        var now = new Date().getTime();
        this.time = this.time + now - this.startTime;
        showStartButton();
    }
    Timer.prototype.stop = function() {
        this.time = 0;
        this.isRunning = false;
        this.startTime = 0;
        this.timerId = 0;
        this.timeTableIndex = 0;
        showStartButton();
        $info.innerHTML = '';
    }
    var timer = new Timer();

    $startButton.addEventListener('click', function() {
        timer.time -= $startInput.value * 1000 + 3000;
        timer.start();
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