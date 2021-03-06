var $info;
var $sounds = [];
var $soundStart;
var $soundEnd;
var $volume;
var $startInput;
var $startInputArea;
var $content;
var $clock;
var soundTable = [60, 30, 15, 5, 0];
var volume = window.localStorage.getItem('pubgtimer_volume') / 100 || 0.5;
var timer;
var Timer = function() {
    this.time = 0;
    this.isRunning = false;
    this.startTime = 0;
    this.timerId = 0;

    this.START = 0;
    this.NORMAL = 1;
    this.END = 2;
    this.MARGIN = 3;

    this.MARGIN_TIME = 3500;

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
    this.timerId = window.requestAnimationFrame(this.loop.bind(this));
};
Timer.prototype.loop = function() {
    $clock.innerHTML = formatDate(new Date(), 'hh:mm:ss');;
    if (!this.isRunning) {
        this.timerId = window.requestAnimationFrame(this.loop.bind(this));
        return;
    }
    var rest;
    var now = new Date().getTime();
    var time = this.time + now - this.startTime;

    var timeTable = this.timeTable[this.timeTableIndex];
    var targetTime = timeTable.time * 1000;

    var infoPrefix = '';
    switch(timeTable.type) {
    case this.START:
        infoPrefix = 'マッチ開始まで';
        if (targetTime <= time) {
            $soundStart.volume = volume;
            $soundStart.play();
            this.timeTableIndex++;
        }
        rest = targetTime - time - this.MARGIN_TIME;
        rest = rest < 0 ? 0 : rest;
        break;
    case this.NORMAL:
        infoPrefix = '範囲収縮まで';
        if (targetTime - soundTable[this.soundIndex] * 1000 <= time) {
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
        rest = targetTime - time;
        break;
    case this.END:
        infoPrefix = '次エリア決定まで';
        if (targetTime <= time) {
            $soundEnd.volume = volume;
            $soundEnd.play();
            this.timeTableIndex++;
        }
        rest = targetTime - time;
        break;
    }
    var restSec = Math.ceil(rest / 1000);
    $info.innerHTML = infoPrefix + Math.floor(restSec / 60) + '分' + restSec % 60 + '秒';

    this.timerId = window.requestAnimationFrame(this.loop.bind(this));
};
Timer.prototype.start = function() {
    this.time = this.time - this.MARGIN_TIME - $startInput.value * 1000;
    this.startTime = new Date().getTime();
    this.isRunning = true;
    $startInputArea.style.display = 'none';
    var event = new Event('startTimer');
    window.dispatchEvent(event);
};
Timer.prototype.pause = function() {
    this.isRunning = false;
    var now = new Date().getTime();
    this.time = this.time + now - this.startTime;
    var event = new Event('pauseTimer');
    window.dispatchEvent(event);
};
Timer.prototype.stop = function() {
    this.time = 0;
    this.isRunning = false;
    this.startTime = 0;
    this.timerId = 0;
    this.timeTableIndex = 0;
    $startInputArea.style.display = 'block';
    $info.innerHTML = '';
    var event = new Event('stopTimer');
    window.dispatchEvent(event);
};
Timer.prototype.toggle = function() {
    if (this.isRunning) {
        this.stop();
    } else {
        this.start();
    }
};
Timer.prototype.forwardTime = function() {
    if (this.isRunning) {
        this.time += 1000;
    } else {
        var length = $startInput.selectedIndex + 1;
        length = length >= $startInput.length ? $startInput.length - 1 : length;
        $startInput.selectedIndex = length;
    }
};
Timer.prototype.backwardTime = function() {
    if (this.isRunning) {
        this.time -= 1000;
    } else {
        var length = $startInput.selectedIndex - 1;
        length = length < 0 ? 0 : length;
        $startInput.selectedIndex = length;
    }
};
window.addEventListener('DOMContentLoaded', function() {
    $info = document.querySelector('#info');
    $startInput = document.querySelector('#startInput');
    $startInputArea = document.querySelector('#startInputArea');
    for (var i = 0, n = soundTable.length; i < n; i++) {
        $sounds.push(document.querySelector('#sound' + soundTable[i]));
    }
    $soundStart = document.querySelector('#soundstart');
    $soundEnd = document.querySelector('#soundend');
    $volume = document.querySelector('#volume');
    $volume.addEventListener('change', function() {
        volume = this.value / 100;
        window.localStorage.setItem('pubgtimer_volume', this.value);
    });
    $volume.value = volume * 100;

    var $startButton = document.querySelector('#startButton');
    $startButton.addEventListener('click', function() {
        timer.start();
    });

    $clock = document.querySelector('#clock');
    $content = document.querySelector('#content');

    timer = new Timer();
}, false);

var setWindowBorder = function(flag) {
    if (flag) {
        document.body.classList.add('border');
    } else {
        document.body.classList.remove('border');
    }
};
var toggleClock = function() {
    if ($clock.classList.contains('hidden')) {
        $clock.classList.remove('hidden');
        $content.classList.add('hidden');
    } else {
        $clock.classList.add('hidden');
        $content.classList.remove('hidden');
    }
};
var formatDate = function (date, format) {
  if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  if (format.match(/S/g)) {
    var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
    var length = format.match(/S/g).length;
    for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
  }
  return format;
};
