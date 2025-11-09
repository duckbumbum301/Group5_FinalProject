// animations-helper.js - Optimized animation utilities for Back Office
// ⚡ Performance optimizations applied

export const animateElement = (element, animationClass, duration = 500) => {
  if (!element) return;

  element.classList.add(animationClass);

  setTimeout(() => {
    element.classList.remove(animationClass);
  }, duration);
};

export const staggerAnimation = (selector, baseDelay = 50) => {
  // ⚡ Use requestAnimationFrame for smooth animations
  const elements = document.querySelectorAll(selector);

  if (elements.length === 0) return;

  // ⚡ Batch DOM reads and writes
  requestAnimationFrame(() => {
    elements.forEach((el, index) => {
      el.style.animationDelay = `${index * baseDelay}ms`;
      el.classList.add("fade-slide-up");
    });
  });
};

export const countUpAnimation = (element, targetValue, duration = 800) => {
  // ⚡ Reduced from 1000ms
  if (!element) return;

  const startValue = 0;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out cubic)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(
      startValue + (targetValue - startValue) * easeOut
    );

    element.textContent = currentValue.toLocaleString("vi-VN");

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.textContent = targetValue.toLocaleString("vi-VN");
    }
  };

  requestAnimationFrame(animate);
};

export const fadeIn = (element, duration = 250) => {
  // ⚡ Reduced from 300ms
  if (!element) return;

  element.style.opacity = "0";
  element.style.display = "block";

  requestAnimationFrame(() => {
    element.style.transition = `opacity ${duration}ms ease-out`;
    element.style.opacity = "1";
  });
};

export const fadeOut = (element, duration = 250) => {
  // ⚡ Reduced from 300ms
  if (!element) return;

  element.style.transition = `opacity ${duration}ms ease-out`;
  element.style.opacity = "0";

  setTimeout(() => {
    element.style.display = "none";
  }, duration);
};

export const slideIn = (element, direction = "right", duration = 300) => {
  // ⚡ Reduced from 400ms
  if (!element) return;

  const animations = {
    right: "animate-slide-in-right",
    left: "animate-slide-in-left",
    up: "fade-slide-up",
    down: "slide-down",
  };

  element.classList.add(animations[direction] || animations.right);
};

// ⚡ Optimized ripple effect with event delegation
let rippleStylesInjected = false;

export const addRippleEffect = (button) => {
  if (!button) return;

  // ⚡ Inject styles only once
  if (!rippleStylesInjected) {
    const style = document.createElement("style");
    style.textContent = `
      .ripple { position: relative; overflow: hidden; }
      .ripple-circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.5s ease-out;
        pointer-events: none;
      }
      @keyframes ripple-animation {
        to { transform: scale(4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    rippleStylesInjected = true;
  }

  button.classList.add("ripple");

  // ⚡ Use passive event listener
  button.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple-circle");

    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.classList.add("ripple-effect");

    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
};

export const animateCard = (card, index = 0) => {
  if (!card) return;

  card.classList.add("card", "animate-scale-in");
  card.style.animationDelay = `${index * 50}ms`;
};

export const animateKPI = (kpiElement, value, label, icon = "📊") => {
  if (!kpiElement) return;

  const iconEl = kpiElement.querySelector(".icon");
  const valEl = kpiElement.querySelector(".val");

  if (iconEl) {
    iconEl.classList.add("bounce-in");
    iconEl.textContent = icon;
  }

  if (valEl) {
    valEl.classList.add("count-up");

    // Animate number if it's numeric
    const numericValue =
      typeof value === "number"
        ? value
        : parseInt(value.replace(/[^0-9]/g, ""));
    if (!isNaN(numericValue)) {
      countUpAnimation(valEl, numericValue);
    } else {
      valEl.textContent = value;
    }
  }

  kpiElement.classList.add("hover-lift");
};

export const loadingSpinner = (container, message = "Đang tải...") => {
  if (!container) return;

  const spinner = document.createElement("div");
  spinner.className = "spinner-container";
  spinner.innerHTML = `
    <div class="spinner"></div>
    <p class="muted small" style="margin-top: 12px; text-align: center;">${message}</p>
  `;

  container.innerHTML = "";
  container.appendChild(spinner);

  return spinner;
};

export const successAnimation = (container, message = "Thành công!") => {
  if (!container) return;

  const success = document.createElement("div");
  success.className = "success-container";
  success.style.cssText =
    "display: flex; flex-direction: column; align-items: center; padding: 40px;";
  success.innerHTML = `
    <div class="success-checkmark"></div>
    <p style="margin-top: 16px; font-weight: 600; color: var(--success);">${message}</p>
  `;

  container.innerHTML = "";
  container.appendChild(success);

  setTimeout(() => {
    fadeOut(success);
  }, 2000);
};

export const shimmerEffect = (element) => {
  if (!element) return;

  element.classList.add("skeleton-shimmer");
};

export const pageTransition = (viewElement) => {
  if (!viewElement) return;

  viewElement.classList.remove("page-enter");

  // Trigger reflow
  void viewElement.offsetWidth;

  viewElement.classList.add("page-enter");
};

export const smoothScrollTo = (element, offset = 0) => {
  if (!element) return;

  const y = element.getBoundingClientRect().top + window.pageYOffset + offset;

  window.scrollTo({
    top: y,
    behavior: "smooth",
  });
};

export const pulseAttention = (element, duration = 2000) => {
  if (!element) return;

  element.classList.add("attention");

  setTimeout(() => {
    element.classList.remove("attention");
  }, duration);
};

export const initAnimations = () => {
  // Add animations to all buttons
  document.querySelectorAll(".btn").forEach((btn) => {
    addRippleEffect(btn);
  });

  // Add hover effects to all cards
  document.querySelectorAll(".card").forEach((card) => {
    card.classList.add("hover-lift");
  });

  // Add page transition
  const viewElement = document.querySelector("#view");
  if (viewElement) {
    pageTransition(viewElement);
  }

  // Stagger animate cards
  staggerAnimation(".kpi", 100);
};

// Initialize animations when DOM is ready
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initAnimations);
}
