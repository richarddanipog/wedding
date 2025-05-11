class Slideshow {
  constructor() {
    this.container = document.getElementById('imageContainer');
    this.images = [];
    this.currentIndex = 0;
    this.remainingImages = [];
    this.transitionInterval = 2000;
    this.transitionTimer = null;
  }

  async loadImages() {
    try {
      const response = await fetch('./images/images.json');
      if (!response.ok) throw new Error('Failed to load images.json');

      const imageNames = await response.json();
      if (!Array.isArray(imageNames) || imageNames.length === 0) {
        throw new Error('No images found in images.json');
      }

      // Remove loading message
      this.container.innerHTML = '';

      // Preload images
      await Promise.all(
        imageNames.map((imageName, index) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = `./images/${imageName}`;
            img.alt = `Wedding Image ${index + 1}`;

            img.onload = () => {
              if (index === 0) img.classList.add('active');
              this.container.appendChild(img);
              this.images.push(img);
              resolve();
            };

            img.onerror = () => {
              console.error(`Failed to load image: ${imageName}`);
              reject(new Error(`Failed to load image: ${imageName}`));
            };
          });
        })
      );

      return this.images.length;
    } catch (error) {
      this.showError(error.message);
      return 0;
    }
  }

  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  getNextImage() {
    if (this.remainingImages.length === 0) {
      this.remainingImages = Array.from(
        { length: this.images.length },
        (_, i) => i
      ).filter((i) => i !== this.currentIndex);
      this.remainingImages = this.shuffleArray(this.remainingImages);
    }
    return this.remainingImages.pop();
  }

  switchImage() {
    this.images[this.currentIndex].classList.remove('active');
    this.currentIndex = this.getNextImage();
    this.images[this.currentIndex].classList.add('active');
  }

  start() {
    if (this.transitionTimer) {
      clearInterval(this.transitionTimer);
    }
    this.transitionTimer = setInterval(
      () => this.switchImage(),
      this.transitionInterval
    );
  }

  showError(message) {
    this.container.innerHTML = `<div class="error">Error: ${message}</div>`;
  }

  async init() {
    const imageCount = await this.loadImages();
    if (imageCount > 0) {
      this.start();
    }
  }
}

// Initialize the slideshow when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const slideshow = new Slideshow();
  slideshow.init();
});
