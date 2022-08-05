
/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
*/
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

    const player = $('.player');
    const cd = $('.cd');
    const heading = $('header h2');
    const cdThumb = $('.cd-thumb');
    const audio = $('audio');
    const playBtn = $('.btn-toggle-play');
    const progress = $('#progress');
    const nextBtn = $('.btn-next');
    const prevBtn = $('.btn-prev');
    const randomBtn = $('.btn-random');
    const repeatBtn = $('.btn-repeat');
    const playlist = $('.playlist');
    const PLAYER_STORAGE_KEY = 'F8_music_player_config';

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) ?? {},
    songs: [
        {
            name:'Anh đã lạc vào',
            singer: 'Green x Prod Truzg',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.png'
        },
        {
            name:'Có hẹn với thanh xuân',
            singer: 'MONSTAR',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.png'
        },
        {
            name:'MISSING YOU',
            singer: 'PHƯƠNG LY x TINLE',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.png'
        },
        {
            name:'Ngày đầu tiên',
            singer: 'ĐỨC PHÚC',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.png'
        },
        {
            name:'THICHTHICH',
            singer: 'PHƯƠNG LY',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.png'
        },
        {
            name:'Vaicaunoicokhie...',
            singer: 'GREY D x tlinh',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.png'
        },
        {
            name:'Váy hoa nhí',
            singer: 'Hoàng Minh Châu',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.png'
        },
        {
            name:'Vì mẹ anh bắt chia...',
            singer: 'MIU LÊ x KARIK x CHÂU ĐĂNG KHOA',
            path: './assets/music/song8.mp3',
            image: './assets/img/song8.png'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
        });

        $('.playlist').innerHTML = htmls.join('\n');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function() {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //10 seconds
            iterations: Infinity //loop
        })
        cdThumbAnimate.pause();

        // ** Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {

            // Một số trình duyệt có thể
            // không hỗ trợ window.scrollY
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            // console.log(scrollTop);
            let newCdWidth = cdWidth - scrollTop;

            // Trong trường hợp kéo nhanh quá
            // có thể scrollTop sẽ về giá trị âm
            // nên set width sẽ bị lỗi nên cần
            // phải làm thao tác nếu nhỏ hơn 0
            // thì set width về 0
            cd.style.width = newCdWidth > 0 ? `${newCdWidth}px` : 0;
            cd.style.opacity = newCdWidth/cdWidth;
        }

        // ** Xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        
        // ** Khi bài hát thực sự được play :))
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // ** Khi bài hát thực sự được pause :))
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // ** Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            progress.value = audio.duration ? Math.floor((audio.currentTime/audio.duration) *100 + 1) : 0;
            
            // Show audio duration
            const audioDuration = audio.duration/60;
            const minDuration = Math.floor(audioDuration); // số phút
            const secDuration = Math.floor((audioDuration - minDuration)*60); // số giây
            $('.duration').textContent = audio.duration ? `${minDuration}:${secDuration}` : '--';

            // Show audio curent time
            const audioCurrentTime = audio.currentTime/60;
            const minCurrentTime = Math.floor(audioCurrentTime);
            let secCurrentTime = Math.floor((audioCurrentTime - minCurrentTime)*60);
            secCurrentTime = secCurrentTime < 10 ? `0${secCurrentTime}` : secCurrentTime;
            $('.current-time').textContent = audio.currentTime ? `${minCurrentTime}:${secCurrentTime}` : '0:00';
        }

        // ** Xử lý khi tua bài hát
        progress.onchange = function(e) {
            const seekTime = (e.target.value * audio.duration)/100;
            audio.currentTime = seekTime;
        }

        // ** Khi next bài hát
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();

            // Render lại để hiện active bài hát
            _this.render();

            // Scroll bài hát đang phát vào vùng hiển thị
            _this.scrollSongIntoView();
        }

        // ** Khi previous bài hát
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();

            // Render lại để hiện active bài hát
            _this.render();

            // Scroll bài hát đang phát vào vùng hiển thị
            _this.scrollSongIntoView();
        }

        // ** Khi bật / tắt random bài hát
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);

            // hàm toggle kiểm tra đối số thứ 2 truyền vào
            // để thêm hoặc xóa class
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // ** Xử lý next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play(); // phát lại bài hát
            } else {
                nextBtn.click(); // chuyển sang bài tiếp theo
            }

            // Render lại để hiện active bài hát
            _this.render();

            // Scroll bài hát đang phát vào vùng hiển thị
            _this.scrollSongIntoView();
        }

        // ** Xử lý khi bật tắt repeat bài hát
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);

            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // ** Xử lý khi click vào bài hát
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');

            if(songNode || e.target.closest('.option')) {
                
                // Khi click vào bài hát không active
                if(songNode) {
                    // dataset trả về dạng chuỗi cần chuyển về number
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();

                    // Render lại để hiện active bài hát
                    _this.render();

                    audio.play();
                }

                // Khi click vào option
                if(e.target.closest('.option')) {

                }
            }
        }

    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex > this.songs.length - 1) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollSongIntoView: function() { // bonus :))
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "nearest"
            });
        }, 300);
    },
    loadConfig() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    start: function() {
        // Load config từ local storage vào ứng dụng
        this.loadConfig();
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents();
        
        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // render playlist
        this.render();

    }
}

app.start();
