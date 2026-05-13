class Slider {
  constructor(options) {
    this.images = options.images || [];    /*конфігурація*/
    this.duration = options.duration || 500;
    this.autoplay = options.autoplay ?? true;
    this.showArrows = options.showArrows ?? true;
    this.showDots = options.showDots ?? true;

    this.index = 0;
    this.timer = null;

    this.track = document.getElementById("track");
    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.dotsContainer = document.getElementById("dots");
    this.slider = document.getElementById("slider");

    this.init();
  }

  init() {
    this.renderSlides();
    this.renderDots();
    this.update();

    if (!this.showArrows) {
      this.prevBtn.style.display = "none";
      this.nextBtn.style.display = "none";
    }

    this.prevBtn.addEventListener("click", () => this.prev());
    this.nextBtn.addEventListener("click", () => this.next());

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.prev();
      if (e.key === "ArrowRight") this.next();
    });

    this.slider.addEventListener("mouseenter", () => this.stopAutoplay());
    this.slider.addEventListener("mouseleave", () => this.startAutoplay());

    if (this.autoplay) this.startAutoplay();
  }

  renderSlides() {
    this.track.innerHTML = this.images
      .map(img => `<div class="slide"><img src="${img}" /></div>`)
      .join("");
  }

  renderDots() {
    if (!this.showDots) return;

    this.dotsContainer.innerHTML = this.images
      .map((_, i) => `<span class="dot" data-i="${i}"></span>`)
      .join("");

    this.dotsContainer.querySelectorAll(".dot").forEach(dot => {
      dot.addEventListener("click", (e) => {
        this.index = +e.target.dataset.i;
        this.update();
      });
    });
  }

  update() {
    this.track.style.transition = `${this.duration}ms ease`;
    this.track.style.transform = `translateX(-${this.index * 100}%)`;

    if (this.showDots) {
      document.querySelectorAll(".dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === this.index);
      });
    }
  }

  next() {
    this.index = (this.index + 1) % this.images.length;
    this.update();
  }

  prev() {
    this.index = (this.index - 1 + this.images.length) % this.images.length;
    this.update();
  }

  startAutoplay() {
    if (!this.autoplay) return;
    this.timer = setInterval(() => this.next(), 3000); /*autoplay*/
  }

  stopAutoplay() {
    clearInterval(this.timer);
  }
}

// Ініціалізація
new Slider({
  images: [
    "https://picsum.photos/id/1015/800/400",
    "https://picsum.photos/id/1016/800/400",
    "https://picsum.photos/id/1018/800/400",
    "https://picsum.photos/id/1020/800/400"
  ],
  duration: 600,
  autoplay: true,
  showArrows: true,
  showDots: true
});