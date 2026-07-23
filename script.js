// گۆڕاوە جیهانییەکان بۆ مۆسیقا
let audio = null;
let isPlaying = false;

document.addEventListener("DOMContentLoaded", () => {
    // دروستکردنی فایلی دەنگی داینامیکی یەکجار بۆ هەموو شوێنێک
    if (typeof WEDDING_CONFIG !== "undefined" && WEDDING_CONFIG.backgroundMusicUrl) {
        audio = new Audio(WEDDING_CONFIG.backgroundMusicUrl);
        audio.loop = true;
        audio.volume = 0.5; // قەبارەی دەنگی مامناوەند
    }

    // پەیوەستکردنی لۆجیکی کردنەوەی نامەکە (Envelope Overlay)
    setupEnvelope();

    // ١. بارکردنی زانیارییەکان لە کۆنفیگەوە بۆ ناو لاپەڕەکە
    setupWeddingDetails();

    // ٢. چالاککردنی ژمێرەری کاتەکە
    startCountdown();

    // ٣. چارەسەرکردنی ناردنی فۆڕمی RSVP بە فۆرمسپری (AJAX)
    setupRSVPForm();

    // ٤. کۆنتڕۆڵکردنی مۆسیقای پاشبنەما
    setupAudioPlayer();

    // ٥. چالاککردنی ئەنیمەیشنی دەرکەوتن لەکاتی سکڕۆڵکردن (Scroll Reveal)
    setupScrollReveal();
});

// ١. بارکردنی زانیارییەکان لە کۆنفیگەوە بۆ ناو لاپەڕەکە
function setupWeddingDetails() {
    if (typeof WEDDING_CONFIG === "undefined") {
        console.error("Wedding config not found!");
        return;
    }

    // ناوی بووک و زاوا لە بەشی Hero و سەرەوەی لاپەڕە
    const brideElements = document.querySelectorAll(".bride-name-val");
    const groomElements = document.querySelectorAll(".groom-name-val");
    
    brideElements.forEach(el => el.textContent = WEDDING_CONFIG.brideName);
    groomElements.forEach(el => el.textContent = WEDDING_CONFIG.groomName);

    // بەرواری ئاهەنگەکە
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateObj = new Date(WEDDING_CONFIG.weddingDate);
    
    // نیشاندانی بەروار بە زمانی کوردی (یاخود عەرەبی بۆ فۆرماتی ڕێک کە لە کوردی بەکاردێت)
    let formattedDate = dateObj.toLocaleDateString('ar-IQ', dateOptions);
    // وەرگێڕانی ناوەکان بۆ کوردی ئەگەر پێویست بکات
    formattedDate = translateDateToKurdish(formattedDate);

    const dateElements = document.querySelectorAll(".wedding-date-val");
    dateElements.forEach(el => el.textContent = formattedDate);

    // زانیاری هۆڵەکە
    const venueNameEl = document.getElementById("venue-name");
    const venueAddressEl = document.getElementById("venue-address");
    const mapIframeEl = document.getElementById("map-iframe");

    if (venueNameEl) venueNameEl.textContent = WEDDING_CONFIG.venueName;
    if (venueAddressEl) venueAddressEl.textContent = WEDDING_CONFIG.venueAddress;
    if (mapIframeEl) {
        mapIframeEl.src = WEDDING_CONFIG.googleMapsEmbedUrl;
    }
}

// وەرگێڕانی ناوی ڕۆژەکان و مانگەکانی عەرەبی بۆ کوردی بۆ جوانی زیاتر
function translateDateToKurdish(dateStr) {
    const translations = {
        "السبت": "شەممە", "الأحد": "یەکشەممە", "الإثنين": "دووشەممە", "الثلاثاء": "سێشەممە", 
        "الأربعاء": "چوارشەممە", "الخميس": "پێنجشەممە", "الجمعة": "هەینی",
        "يناير": "کانوونی دووەم", "فبراير": "شوبات", "مارس": "ئادار", "أبريل": "نیسان",
        "مايو": "ئایار", "يونيو": "حوزەیران", "يوليو": "تەممووز", "أغسطس": "ئاب",
        "سبتمبر": "ئەیلوول", "أكتوبر": "تشرینی یەکەم", "نوفمبر": "تشرینی دووەم", "ديسمبر": "کانوونی دووەم"
    };

    let result = dateStr;
    for (const [ar, ku] of Object.entries(translations)) {
        result = result.replace(new RegExp(ar, 'g'), ku);
    }
    return result;
}

// ٢. چالاککردنی ژمێرەری کاتەکە
function startCountdown() {
    const targetDate = new Date(WEDDING_CONFIG.weddingDate).getTime();

    const daysVal = document.getElementById("days");
    const hoursVal = document.getElementById("hours");
    const minutesVal = document.getElementById("minutes");
    const secondsVal = document.getElementById("seconds");
    const countdownContainer = document.getElementById("countdown-container");

    if (!daysVal || !hoursVal || !minutesVal || !secondsVal) return;

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // کاتەکە تەواو بووە
        if (distance < 0) {
            clearInterval(interval);
            if (countdownContainer) {
                countdownContainer.innerHTML = `<div class="wedding-started-msg">ئەمڕۆ ڕۆژی ئاهەنگەکەیە! بەخێر بێن ❤️</div>`;
            }
            return;
        }

        // حیسابکردنی کاتەکان
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // نوێکردنەوەی ژمارەکان لە لاپەڕەکەدا بە فۆرماتکردنی دوو خانەیی (09 لەبری 9)
        daysVal.textContent = String(days).padStart(2, '0');
        hoursVal.textContent = String(hours).padStart(2, '0');
        minutesVal.textContent = String(minutes).padStart(2, '0');
        secondsVal.textContent = String(seconds).padStart(2, '0');
    }, 1000);
}

// ٣. چارەسەرکردنی ناردنی فۆڕمی RSVP بە فۆرمسپری (AJAX)
function setupRSVPForm() {
    const form = document.getElementById("rsvp-form");
    const formContainer = document.getElementById("rsvp-form-container");
    const successMsg = document.getElementById("rsvp-success-message");
    const errorMsg = document.getElementById("rsvp-error-message");
    const submitBtn = document.getElementById("rsvp-submit-btn");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // وەرگرتنی زانیارییەکان بۆ پشکنین
        const fullName = document.getElementById("full-name").value.trim();
        const guestsCount = document.getElementById("guests-count").value;
        const attendance = document.querySelector('input[name="attendance"]:checked')?.value;

        if (!fullName) {
            alert("تکایە ناوی سیانی خۆت بنووسە.");
            return;
        }

        // پیشاندانی دۆخی بارکردن (Loading)
        submitBtn.disabled = true;
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>دەنێردرێت...</span> <span class="spinner"></span>`;
        errorMsg.classList.add("hidden");

        const data = {
            "ناوی سیانی": fullName,
            "ژمارەی یاوەران": guestsCount,
            "ئامادەبوون": attendance === "yes" ? "ئامادە دەبێت" : "ئامادە نابێت"
        };

        const formspreeUrl = `https://formspree.io/f/${WEDDING_CONFIG.formspreeId}`;

        try {
            const response = await fetch(formspreeUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // ناردن سەرکەوتوو بوو
                formContainer.classList.add("hidden");
                successMsg.classList.remove("hidden");
                successMsg.scrollIntoView({ behavior: 'smooth' });
            } else {
                // کێشەیەک هەیە لە ناردندا
                throw new Error("سێرڤەر کێشەی هەیە");
            }
        } catch (error) {
            console.error("Error submitting RSVP form:", error);
            errorMsg.classList.remove("hidden");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// ٤. کۆنتڕۆڵکردنی مۆسیقای پاشبنەما
function setupAudioPlayer() {
    const musicBtn = document.getElementById("music-toggle-btn");
    const musicIcon = document.getElementById("music-icon");
    const musicText = document.getElementById("music-text");

    if (!musicBtn || !musicIcon || !audio) return;

    // کردارەکە لەکاتی داگرتنی دوگمەکە
    musicBtn.addEventListener("click", () => {
        if (isPlaying) {
            audio.pause();
            musicIcon.innerHTML = `🎵`;
            musicBtn.classList.remove("playing");
            if (musicText) musicText.textContent = "کارپێکردنی مۆسیقا";
            isPlaying = false;
        } else {
            audio.play().then(() => {
                musicIcon.innerHTML = `⏸️`;
                musicBtn.classList.add("playing");
                if (musicText) musicText.textContent = "ڕاگرتنی مۆسیقا";
                isPlaying = true;
            }).catch(err => {
                console.error("Audio playback error:", err);
                alert("براوزەرەکەت ڕێگری کرد لە مۆسیقا. تکایە دووبارە کرتە بکەرەوە.");
            });
        }
    });
}

// ٥. چالاککردنی ئەنیمەیشنی دەرکەوتن لەکاتی سکڕۆڵکردن (Scroll Reveal)
function setupScrollReveal() {
    const reveals = document.querySelectorAll(".reveal");

    if (reveals.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15 // کاتێک ١٥٪ی بەشەکە دەرکەوت، ئەنیمەیشنەکە دەستپێدەکات
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                // لایبەرە بۆ ئەوەی ئەنیمەیشنەکە تەنها یەکجار کاربکات
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => observer.observe(el));
}

// ٦. لۆجیکی مۆرکردن و کردنەوەی نامەکە (Envelope Overlay)
function setupEnvelope() {
    const overlay = document.getElementById("envelope-overlay");
    const envelope = document.getElementById("open-envelope-btn"); // ئەمە خۆی دەبێتە پۆستەکە
    const musicBtn = document.getElementById("music-toggle-btn");
    const musicIcon = document.getElementById("music-icon");
    const musicText = document.getElementById("music-text");

    if (!overlay || !envelope) return;

    envelope.addEventListener("click", () => {
        // ١. کردنەوەی نامەکە بە ئەفێکتی گۆڕانکاری
        envelope.classList.add("open");

        // ٢. کارپێکردنی مۆسیقا بەهۆی کارلێکی یەکەم
        if (audio && !isPlaying) {
            audio.play().then(() => {
                isPlaying = true;
                if (musicBtn && musicIcon) {
                    musicIcon.innerHTML = `⏸️`;
                    musicBtn.classList.add("playing");
                    if (musicText) musicText.textContent = "ڕاگرتنی مۆسیقا";
                }
            }).catch(err => {
                console.log("Autoplay prevented on open:", err);
            });
        }

        // ٣. شاردنەوەی پەڕەی نامەکە دوای ١.٥ چرکە لە نیشاندانی ئەنیمەیشنی کردنەوە
        setTimeout(() => {
            overlay.classList.add("hidden-envelope");
            
            // چالاککردنی پێشاندانی لاپەڕەی سەرەکی
            const heroFrame = document.querySelector(".hero-frame");
            if (heroFrame) {
                heroFrame.classList.add("active");
            }
        }, 1500);
    });
}
