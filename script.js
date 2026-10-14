/* ==========================================================================
   ROMANTIC BIRTHDAY CARD - JAVASCRIPT ENGINE
   Vanilla JS (No External Libraries), Clean Modular Architecture
   ========================================================================== */
const CATEGORY_ORDER = [
  "hotay",
  "phuquoc",
  "qua",
  "anhvsem",
  "hoaanhtang",
  "anhemgui",
  "tet",
  "totnghiep",
];
/* --------------------------------------------------------------------------
   1. USER CONFIGURATION (Dễ dàng chỉnh sửa)
   -------------------------------------------------------------------------- */
const birthdayConfig = {
  // Tên người yêu (được hiển thị trên Hero section & toàn bộ trang)
  girlfriendName: "Em Yêu",

  // Thông điệp mở đầu
  introMessage: "Anh có một món quà nhỏ dành cho em... Click để mở nhé ❤️",

  // Các câu chúc dạng gõ chữ (typing animation)
  typingWishes: [
    "Chúc mừng 1 năm ngày kỷ niệm tình yêu của chúng mình.",
    "Cảm ơn em vì đã xuất hiện và làm cho thế giới của anh trở nên ngọt ngào và thật ấm áp.",
    "Mong rằng chúng ta sẽ luôn có nhau đi cùng nhau qua mọi khó khăn.",
    "Em có muốn xem kho báu của anh khummmmm",
  ],

  // Nội dung bức thư tình
  letter: `Em à,

Hôm nay là một ngày rất đặc biệt... Ngày mà thế giới này chào đón một cô gái vô cùng tuyệt vời.

Cảm ơn em vì đã xuất hiện trong cuộc đời anh, mang đến cho anh những nụ cười rạng rỡ và những khoảnh khắc dịu dàng nhất.

Anh mong rằng tuổi mới của em sẽ luôn tràn ngập bình yên, may mắn và đạt được mọi ước mơ em ấp ủ.

Và anh mong rằng, anh vẫn sẽ luôn được ở bên em, nắm tay em đi qua thật nhiều mùa sinh nhật tiếp theo.

Happy Birthday, tình yêu của anh ❤️`,

  // Thông điệp kết thúc
  finalMessage: "Anh yêu em ❤️",

  // Đường dẫn nhạc & video (tự động phát hiện nếu tồn tại)
  musicUrl: "./assets/music/birthday.mp3",
  videoUrl: "./assets/videos/birthday.mp4",
};

/* --------------------------------------------------------------------------
   2. GLOBAL STATE MANAGERS
   -------------------------------------------------------------------------- */
let manifestData = window.BIRTHDAY_IMAGE_MANIFEST || [];
let currentLightboxIndex = 0;
let activeGalleryPhotos = [];
let audioContext = null;
let bgAudioElement = null;
let isAudioPlaying = false;
let isAllPhotosExpanded = false;

/* --------------------------------------------------------------------------
   3. MAIN INITIALIZATION
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  console.log("Initializing Romantic Birthday Application...");

  // Fallback check if manifest loaded properly
  if (!manifestData || manifestData.length === 0) {
    attemptLoadManifestJson();
  }

  initParticles();
  initGift();
  initHero();
  initWishes();
  initGallery();
  initLightbox();
  initTimeline();
  initVideo();
  initMusic();
  initLetter();
  initFinal();
}

/* --------------------------------------------------------------------------
   4. FALLBACK MANIFEST LOADER
   -------------------------------------------------------------------------- */
function attemptLoadManifestJson() {
  fetch("./assets/images.json")
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        manifestData = data;
        initHero();
        initGallery();
        initTimeline();
      }
    })
    .catch((err) => {
      console.warn("Could not load assets/images.json fallback:", err);
    });
}

/* --------------------------------------------------------------------------
   5. GIFT OVERLAY SCREEN (MỞ MÓN QUÀ)
   -------------------------------------------------------------------------- */
function initGift() {
  const giftOverlay = document.getElementById("gift-overlay");
  const giftBoxWrapper = document.getElementById("gift-box-wrapper");
  const appContent = document.getElementById("app-content");
  const musicBtn = document.getElementById("music-control-btn");

  if (!giftBoxWrapper || !giftOverlay) return;

  giftBoxWrapper.addEventListener("click", () => {
    // Trigger opening animation
    giftOverlay.classList.add("opening");

    // Play soft chime sound effect via Web Audio API
    playSparkleSound();

    // Confetti burst
    triggerConfettiBurst(50);

    // Try playing background music on user interaction
    playBackgroundMusic();

    // Reveal main content after delay
    setTimeout(() => {
      giftOverlay.classList.add("fade-out");
      appContent.classList.remove("hidden");
      if (musicBtn && bgAudioElement && bgAudioElement.src) {
        musicBtn.classList.remove("hidden");
      }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "instant" });

      // Start typing animation in section 2
      startTypingWishes();
    }, 800);

    setTimeout(() => {
      giftOverlay.style.display = "none";
    }, 1800);
  });
}

/* --------------------------------------------------------------------------
   6. HERO SECTION
   -------------------------------------------------------------------------- */
function initHero() {
  const nameElem = document.getElementById("hero-girlfriend-name");
  const heroImgElem = document.getElementById("hero-img");

  if (nameElem) {
    nameElem.textContent = birthdayConfig.girlfriendName + " ❤️";
  }

  // Pick Hero image from manifest
  const heroItem =
    manifestData.find((item) => item.section === "hero") || manifestData[0];
  if (heroItem && heroImgElem) {
    heroImgElem.src = heroItem.src;
    heroImgElem.alt = heroItem.title || "Hero Photo";
  }
}

/* --------------------------------------------------------------------------
   7. WISHES & TYPING ANIMATION
   -------------------------------------------------------------------------- */
let currentWishIndex = 0;
let currentCharIndex = 0;
let isTyping = false;

function initWishes() {
  const nextBtn = document.getElementById("wishes-next-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const memoriesSec = document.getElementById("memories-section");
      if (memoriesSec) {
        memoriesSec.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

function startTypingWishes() {
  const typingElem = document.getElementById("typing-text");
  if (!typingElem || isTyping) return;

  isTyping = true;
  const wishes = birthdayConfig.typingWishes;
  if (!wishes || wishes.length === 0) return;

  function typeNextChar() {
    if (currentWishIndex >= wishes.length) {
      currentWishIndex = 0; // Loop back or stay at end
    }

    const currentText = wishes[currentWishIndex];

    if (currentCharIndex < currentText.length) {
      typingElem.textContent += currentText.charAt(currentCharIndex);
      currentCharIndex++;
      setTimeout(typeNextChar, 50);
    } else {
      // Finished current sentence, pause before clearing or switching
      setTimeout(() => {
        eraseText();
      }, 3000);
    }
  }

  function eraseText() {
    if (typingElem.textContent.length > 0) {
      typingElem.textContent = typingElem.textContent.substring(
        0,
        typingElem.textContent.length - 1,
      );
      setTimeout(eraseText, 25);
    } else {
      currentWishIndex = (currentWishIndex + 1) % wishes.length;
      currentCharIndex = 0;
      setTimeout(typeNextChar, 500);
    }
  }

  typingElem.textContent = "";
  currentCharIndex = 0;
  typeNextChar();
}

/* --------------------------------------------------------------------------
   8. SCRAPBOOK ALBUM (MEMORIES GALLERY)
   -------------------------------------------------------------------------- */
function initGallery() {
  const grid = document.getElementById("memories-grid");
  const filterPills = document.querySelectorAll(".filter-pill");
  const toggleBtn = document.getElementById("toggle-all-photos-btn");

  if (!grid) return;

  renderGallery("all");

  // Filter pill listeners
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      const filter = pill.getAttribute("data-filter");
      renderGallery(filter);
    });
  });

  // Toggle expand all photos button
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      isAllPhotosExpanded = !isAllPhotosExpanded;
      const activeFilter =
        document
          .querySelector(".filter-pill.active")
          ?.getAttribute("data-filter") || "all";

      if (isAllPhotosExpanded) {
        toggleBtn.querySelector("span").textContent = "Thu gọn album 🌸";
      } else {
        toggleBtn.querySelector("span").textContent =
          `Xem tất cả album ảnh (${manifestData.length} ảnh) ✨`;
      }
      renderGallery(activeFilter);
    });
  }
}

function renderGallery(filter) {
  const grid = document.getElementById("memories-grid");
  if (!grid) return;

  grid.innerHTML = "";

  // 1. Lọc ảnh theo filter hiện tại
  let filtered = manifestData.filter((item) => {
    if (filter === "all") return true;
    if (filter === "hero") return item.section === "hero";
    if (filter === "timeline") return item.section === "timeline";

    if (filter === "memories") {
      return item.section === "memories" || item.category === "gallery";
    }

    if (filter === "final") return item.section === "final";

    return true;
  });

  // 2. Sắp xếp ảnh theo thứ tự category
  if (filter === "all" || filter === "memories") {
    filtered = filtered
      .map((item, index) => ({
        ...item,
        _originalIndex: index,
      }))
      .sort((a, b) => {
        const indexA = CATEGORY_ORDER.indexOf(a.category);
        const indexB = CATEGORY_ORDER.indexOf(b.category);

        // Category không nằm trong danh sách sẽ xếp cuối
        const orderA = indexA === -1 ? CATEGORY_ORDER.length : indexA;

        const orderB = indexB === -1 ? CATEGORY_ORDER.length : indexB;

        // Cùng category thì giữ thứ tự ban đầu
        return orderA - orderB || a._originalIndex - b._originalIndex;
      })
      .map(({ _originalIndex, ...item }) => item);
  }

  // 3. Giới hạn số ảnh khi chưa mở rộng album
  const limit = isAllPhotosExpanded ? filtered.length : 15;

  activeGalleryPhotos = filtered.slice(0, limit);

  // 4. Render danh sách ảnh
  activeGalleryPhotos.forEach((item, index) => {
    // Góc nghiêng kiểu ảnh polaroid
    const angle = ((index * 7) % 9) - 4;

    const card = document.createElement("div");
    card.className = "polaroid-card";
    card.style.setProperty("--rotation", angle);

    card.innerHTML = `
      <div class="polaroid-img-box">
        <img
          src="${item.src}"
          alt="${escapeHtml(item.title || "")}"
          loading="lazy"
        />
      </div>

      <div class="polaroid-caption-box">
        <h3 class="polaroid-title">
          ${escapeHtml(item.title || "Kỷ niệm")}
        </h3>

        <p class="polaroid-caption">
          ${escapeHtml(item.caption || "")}
        </p>
      </div>
    `;

    // Mở lightbox khi click ảnh
    card.addEventListener("click", () => {
      openLightbox(index);
    });

    grid.appendChild(card);
  });
}

/* --------------------------------------------------------------------------
   9. TIMELINE SECTION (HÀNH TRÌNH TÌNH YÊU)
   -------------------------------------------------------------------------- */
function initTimeline() {
  const container = document.getElementById("timeline-container");
  if (!container) return;

  const timelineItems = manifestData.filter(
    (item) => item.section === "timeline",
  );

  // Clear previous items except central line
  const existingItems = container.querySelectorAll(".timeline-item");
  existingItems.forEach((el) => el.remove());

  timelineItems.forEach((item, idx) => {
    const tItem = document.createElement("div");
    tItem.className = "timeline-item";

    const dateText = item.date || `Cột mốc 0${idx + 1}`;

    tItem.innerHTML = `
            <div class="timeline-node">❤️</div>
            <div class="timeline-card glass-card">
                <img src="${item.src}" class="timeline-photo" alt="${escapeHtml(item.title || "")}" loading="lazy" />
                <span class="timeline-date">${escapeHtml(dateText)}</span>
                <h3 class="timeline-title">${escapeHtml(item.title || "Mốc kỷ niệm")}</h3>
                <p class="timeline-desc">${escapeHtml(item.caption || "")}</p>
            </div>
        `;

    container.appendChild(tItem);
  });

  // Scroll reveal observer
  setupScrollReveal();
}

function setupScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15 },
  );

  document.querySelectorAll(".timeline-item").forEach((el) => {
    observer.observe(el);
  });
}

/* --------------------------------------------------------------------------
   10. LIGHTBOX MODAL
   -------------------------------------------------------------------------- */
function initLightbox() {
  const modal = document.getElementById("lightbox-modal");
  const backdrop = document.getElementById("lightbox-backdrop");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  if (!modal) return;

  if (backdrop) backdrop.addEventListener("click", closeLightbox);
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (prevBtn) prevBtn.addEventListener("click", () => navigateLightbox(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => navigateLightbox(1));

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (modal.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  });
}

function openLightbox(index) {
  if (!activeGalleryPhotos || activeGalleryPhotos.length === 0) return;

  currentLightboxIndex = index;
  updateLightboxContent();

  const modal = document.getElementById("lightbox-modal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

function closeLightbox() {
  const modal = document.getElementById("lightbox-modal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

function navigateLightbox(direction) {
  if (!activeGalleryPhotos || activeGalleryPhotos.length === 0) return;

  currentLightboxIndex =
    (currentLightboxIndex + direction + activeGalleryPhotos.length) %
    activeGalleryPhotos.length;
  updateLightboxContent();
}

function updateLightboxContent() {
  const item = activeGalleryPhotos[currentLightboxIndex];
  if (!item) return;

  const img = document.getElementById("lightbox-img");
  const counter = document.getElementById("lightbox-counter");
  const title = document.getElementById("lightbox-title");
  const caption = document.getElementById("lightbox-caption");

  if (img) img.src = item.src;
  if (counter)
    counter.textContent = `${currentLightboxIndex + 1} / ${activeGalleryPhotos.length}`;
  if (title) title.textContent = item.title || "Khoảnh khắc";
  if (caption) caption.textContent = item.caption || "";
}

/* --------------------------------------------------------------------------
   11. VIDEO SECTION
   -------------------------------------------------------------------------- */
function initVideo() {
  const videoSection = document.getElementById("video-section");
  const videoElem = document.getElementById("birthday-video");
  const videoSource = document.getElementById("video-source");

  if (!videoSection || !videoElem || !videoSource) return;

  // Check if video file URL is specified or available
  const videoPath = birthdayConfig.videoUrl;

  if (!videoPath) {
    videoSection.classList.add("hidden");
    return;
  }

  videoSource.src = videoPath;
  videoElem.load();

  // Verify if video actually exists and can be played
  videoElem.addEventListener("error", () => {
    console.log(
      "No valid video file found at assets/videos/. Hiding video section.",
    );
    videoSection.classList.add("hidden");
  });

  videoElem.addEventListener("loadeddata", () => {
    // Video found and loaded! Show section.
    videoSection.classList.remove("hidden");
  });
}

/* --------------------------------------------------------------------------
   12. BACKGROUND MUSIC CONTROLLER
   -------------------------------------------------------------------------- */
function initMusic() {
  const musicBtn = document.getElementById("music-control-btn");
  bgAudioElement = document.getElementById("bg-music");

  if (!musicBtn || !bgAudioElement) return;

  bgAudioElement.src = birthdayConfig.musicUrl;

  musicBtn.addEventListener("click", () => {
    toggleMusic();
  });

  bgAudioElement.addEventListener("error", () => {
    console.log(
      "No custom audio file found at assets/music/. Music widget hidden.",
    );
    musicBtn.classList.add("hidden");
  });
}

function playBackgroundMusic() {
  if (!bgAudioElement || !bgAudioElement.src) return;

  bgAudioElement
    .play()
    .then(() => {
      isAudioPlaying = true;
      const musicBtn = document.getElementById("music-control-btn");
      if (musicBtn) {
        musicBtn.classList.remove("hidden");
        musicBtn.classList.add("playing");
      }
    })
    .catch((err) => {
      console.log(
        "Autoplay prevented by browser. Waiting for explicit click:",
        err,
      );
      isAudioPlaying = false;
    });
}

function toggleMusic() {
  const musicBtn = document.getElementById("music-control-btn");

  if (isAudioPlaying) {
    bgAudioElement.pause();
    isAudioPlaying = false;
    if (musicBtn) musicBtn.classList.remove("playing");
  } else {
    bgAudioElement
      .play()
      .then(() => {
        isAudioPlaying = true;
        if (musicBtn) musicBtn.classList.add("playing");
      })
      .catch((err) => console.error("Audio playback error:", err));
  }
}

/* --------------------------------------------------------------------------
   13. ROMANTIC LOVE LETTER
   -------------------------------------------------------------------------- */
function initLetter() {
  const envelopeBox = document.getElementById("envelope-box");
  const openBtn = document.getElementById("open-letter-btn");
  const modal = document.getElementById("letter-modal");
  const closeBtn = document.getElementById("close-letter-btn");
  const contentBody = document.getElementById("letter-content-body");

  if (!modal) return;

  const openLetter = () => {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Render letter text with typing / paragraph fade
    if (contentBody && contentBody.innerHTML === "") {
      typeLetterText(birthdayConfig.letter);
    }
  };

  if (envelopeBox) envelopeBox.addEventListener("click", openLetter);
  if (openBtn) openBtn.addEventListener("click", openLetter);
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    });
  }
}

function typeLetterText(text) {
  const container = document.getElementById("letter-content-body");
  if (!container) return;

  container.textContent = text;
}

/* --------------------------------------------------------------------------
   14. FINAL CLOSING SECTION
   -------------------------------------------------------------------------- */
function initFinal() {
  const heading = document.getElementById("final-heading");
  const loveDecl = document.getElementById("final-love-declaration");
  const replayBtn = document.getElementById("confetti-replay-btn");
  const finalBgOverlay = document.getElementById("final-bg-overlay");

  if (heading) heading.textContent = "HAPPY BIRTHDAY ❤️";

  // Set background image from final manifest selection
  const finalPhoto =
    manifestData.find((item) => item.section === "final") ||
    manifestData[manifestData.length - 1];
  if (finalPhoto && finalBgOverlay) {
    finalBgOverlay.style.backgroundImage = `url('${finalPhoto.src}')`;
  }

  // Scroll reveal logic for final love declaration
  const finalSec = document.getElementById("final-section");
  if (finalSec) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (loveDecl) loveDecl.classList.remove("hidden");
              triggerConfettiBurst(80);
            }, 1200);
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(finalSec);
  }

  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      triggerConfettiBurst(100);
      playSparkleSound();
    });
  }
}

/* --------------------------------------------------------------------------
   15. BACKGROUND PARTICLES & FLOATING HEARTS CANVAS
   -------------------------------------------------------------------------- */
function initParticles() {
  const canvas = document.getElementById("background-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 25), 45); // Responsive count

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 12 + 6,
      speedY: Math.random() * 0.8 + 0.3,
      speedX: Math.sin(Math.random() * Math.PI) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
      type: Math.random() > 0.4 ? "heart" : "star",
    });
  }

  function drawHeart(x, y, size, color) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    const d = size;
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-d / 2, -d / 2, -d, d / 3, 0, d);
    ctx.bezierCurveTo(d, d / 3, d / 2, -d / 2, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  function drawStar(x, y, size, color) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < -20) {
        p.y = height + 20;
        p.x = Math.random() * width;
      }

      const color =
        p.type === "heart"
          ? `rgba(255, 77, 109, ${p.opacity})`
          : `rgba(255, 209, 102, ${p.opacity})`;

      if (p.type === "heart") {
        drawHeart(p.x, p.y, p.size, color);
      } else {
        drawStar(p.x, p.y, p.size, color);
      }
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   16. CONFETTI BURST GENERATOR
   -------------------------------------------------------------------------- */
function triggerConfettiBurst(count = 60) {
  const container = document.getElementById("confetti-container");
  if (!container) return;

  const colors = ["#ff4d6d", "#ff758f", "#ffd166", "#ffffff", "#ffb3c1"];

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "absolute";
    confetti.style.width = `${Math.random() * 10 + 6}px`;
    confetti.style.height = `${Math.random() * 10 + 6}px`;
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `-20px`;
    confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    confetti.style.opacity = Math.random() + 0.5;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

    const duration = Math.random() * 3 + 2.5;
    confetti.style.transition = `transform ${duration}s linear, top ${duration}s ease-in, opacity ${duration}s ease`;

    container.appendChild(confetti);

    setTimeout(() => {
      confetti.style.top = `${window.innerHeight + 50}px`;
      confetti.style.transform = `rotate(${Math.random() * 720}deg) translateX(${Math.random() * 100 - 50}px)`;
      confetti.style.opacity = "0";
    }, 50);

    setTimeout(() => {
      confetti.remove();
    }, duration * 1000);
  }
}

/* --------------------------------------------------------------------------
   17. WEB AUDIO API SYNTH (CHIME SOUND EFFECT)
   -------------------------------------------------------------------------- */
function playSparkleSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.08, audioContext.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + i * 0.1 + 0.5,
      );

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start(audioContext.currentTime + i * 0.1);
      osc.stop(audioContext.currentTime + i * 0.1 + 0.5);
    });
  } catch (e) {
    // Silent catch if audio context not permitted
  }
}

/* --------------------------------------------------------------------------
   18. UTILITY HELPERS
   -------------------------------------------------------------------------- */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
