const shuffleSeed = require("shuffle-seed");

export class DonorScroll {
  constructor() {
    if (
      !document.querySelector(".donor-list") &&
      !document.querySelector("#donor-ticker")
    )
      return;

    this.donors = [];
    this.isPaused = false;
    this.scrollSpeed = 1; // Speed in pixels per frame
    this.scrollInterval = null;
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion)").matches;

    const donorList = document.querySelectorAll(".donor-list li");
    if (donorList.length > 0) {
      donorList.forEach((donor) => this.donors.push(donor.innerText));
    } else {
      // Default donors
      this.donors = [
        "Anonymous chipped in $15",
        "Marty F. chipped in $50",
        "Cynthia C. chipped in $3",
      ];
    }

    this.init();
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.createTickerContainer();
        this.displayDonations(this.getDonors());
        this.addStyles();
        this.addAccessibilityControls();
        this.addHoverAndFocusControls();
        if (!this.prefersReducedMotion) {
          this.startScrolling();
        }
      });
    } else {
      this.createTickerContainer();
      this.displayDonations(this.getDonors());
      this.addStyles();
      this.addAccessibilityControls();
      this.addHoverAndFocusControls();
      if (!this.prefersReducedMotion) {
        this.startScrolling();
      }
    }
  }

  createTickerContainer() {
    const parentContainer = document.createElement("div");
    parentContainer.id = "ticker-container";
    parentContainer.style.cssText = `
      background-color: #e8e8e8;
      border-radius: 10px;
      padding: 10px;
      border: 1px solid #e9e9e9;
      display: flex;
      align-items: center;
      gap: 1rem;
    `;

    const existingTicker = document.querySelector("#donor-ticker");
    if (existingTicker) {
      existingTicker.parentElement.insertBefore(parentContainer, existingTicker);
      parentContainer.appendChild(existingTicker);
      existingTicker.setAttribute("role", "marquee");
    }
  }

  getDonors(total = 50) {
    const seed = this.getSeed();
    let donors = this.donors;

    while (donors.length < total) {
      donors = donors.concat(shuffleSeed.shuffle(this.donors, seed));
    }

    return shuffleSeed.shuffle(donors, seed).slice(0, total);
  }

  getSeed() {
    const now = new Date();
    const day = now.getDate();
    return day + this.getPageId();
  }

  getPageId() {
    return 1;
  }

  setLocalStorage(key, value) {
    localStorage.setItem(key, value);
  }

  getLocalStorage(key) {
    return localStorage.getItem(key);
  }

  removeLocalStorage(key) {
    localStorage.removeItem(key);
  }

  addStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #donor-ticker {
        display: flex;
        align-items: center;
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
        font-family: open sans, Arial, Helvetica, sans-serif;
        color: #555;
        line-height: 1.4;
        font-weight: 700;
      }

      .ticker {
        display: flex;
        white-space: nowrap;
        will-change: transform;
        transition: transform 0.1s linear;
      }

      .ticker__item {
        flex-shrink: 0;
        padding: 0 2rem;
        font-size: 1.125rem;
        color: #555;
        line-height: 2rem;
        font-weight: 700;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }

  startScrolling() {
    const tickerContainer = document.querySelector("#donor-ticker");
    const ticker = tickerContainer.querySelector(".ticker");
    if (!ticker) return;

    let currentScroll = 0;

    const containerWidth = tickerContainer.offsetWidth;
    const contentWidth = Array.from(ticker.children).reduce(
      (total, item) => total + item.offsetWidth,
      0
    );

    ticker.style.width = `${Math.max(contentWidth, containerWidth)}px`;

    if (this.scrollInterval) clearInterval(this.scrollInterval);

    const savedState = this.getLocalStorage("tickerState");
    this.isPaused = savedState === "paused";

    tickerContainer.setAttribute("data-playing", this.isPaused ? "false" : "true");

    this.scrollInterval = setInterval(() => {
      if (!this.isPaused) {
        currentScroll -= this.scrollSpeed;

        if (Math.abs(currentScroll) >= contentWidth) {
          currentScroll = containerWidth;
        }

        ticker.style.transform = `translateX(${currentScroll}px)`;
      }
    }, 16);
  }

  displayDonations(donors) {
    const tickerElement = document.querySelector("#donor-ticker");

    if (!tickerElement) {
      console.error("Ticker element not found");
      return;
    }

    tickerElement.innerHTML = `<div class="ticker">${donors
      .map((donor) => `<div class="ticker__item">${donor}</div>`)
      .join("")}</div>`;
  }

  addAccessibilityControls() {
    const parentContainer = document.querySelector("#ticker-container");
    if (!parentContainer) return;
  
    const pauseButton = document.createElement("button");
    pauseButton.style.cssText = `
      padding: 0.5rem 1rem;
      font-size: 1rem;
      background-color: #007BFF;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    `;
  
    const FALLBACK_MIN_WIDTH = 75; // Fallback min-width in pixels
  
    // Retrieve saved state and min-width from localStorage
    const savedState = this.getLocalStorage("tickerState");
    const savedMinWidth = parseInt(this.getLocalStorage("buttonMinWidth"), 10);
  
    // Set initial state and label
    this.isPaused = savedState === "paused";
    pauseButton.innerText = this.isPaused ? "Play" : "Pause";
    pauseButton.setAttribute("aria-label", this.isPaused ? "Play scrolling" : "Pause scrolling");
  
    // Set min-width using fallback or saved value
    if (savedMinWidth && savedMinWidth >= FALLBACK_MIN_WIDTH) {
      pauseButton.style.minWidth = `${savedMinWidth}px`;
    } else {
      pauseButton.style.minWidth = `${FALLBACK_MIN_WIDTH}px`;
    }
  
    // Append the button to the container
    parentContainer.insertAdjacentElement("afterbegin", pauseButton);
  
    // After the button is rendered, calculate its actual width
    const buttonWidth = pauseButton.offsetWidth;
  
    // Update min-width if the actual width is larger than fallback
    if (buttonWidth > FALLBACK_MIN_WIDTH) {
      pauseButton.style.minWidth = `${buttonWidth}px`;
      this.setLocalStorage("buttonMinWidth", buttonWidth); // Save the calculated min-width
    }
  
    // Add toggle functionality
    pauseButton.onclick = () => {
      this.isPaused = !this.isPaused;
  
      // Update label and aria-label
      pauseButton.innerText = this.isPaused ? "Play" : "Pause";
      pauseButton.setAttribute(
        "aria-label",
        this.isPaused ? "Play scrolling" : "Pause scrolling"
      );
  
      // Recalculate and update min-width if the button size changes
      const newButtonWidth = pauseButton.offsetWidth;
      if (newButtonWidth > FALLBACK_MIN_WIDTH) {
        pauseButton.style.minWidth = `${newButtonWidth}px`;
        this.setLocalStorage("buttonMinWidth", newButtonWidth);
      }
  
      // Save the state in localStorage
      this.setLocalStorage("tickerState", this.isPaused ? "paused" : "playing");
  
      // Update the ticker's data-playing attribute
      const tickerContainer = document.querySelector("#donor-ticker");
      if (tickerContainer) {
        tickerContainer.setAttribute(
          "data-playing",
          this.isPaused ? "false" : "true"
        );
      }
    };
  }

  addHoverAndFocusControls() {
    const tickerContainer = document.querySelector("#donor-ticker");
    if (!tickerContainer) return;
  
    // Ensure ticker is focusable for keyboard navigation
    tickerContainer.setAttribute("tabindex", "0");
  
    // Pause on hover and update data-hovered
    tickerContainer.addEventListener("mouseenter", () => {
      this.isPaused = true; // Pause scrolling
      tickerContainer.setAttribute("data-hovered", "true");
      tickerContainer.setAttribute("data-playing", "false");
    });
  
    tickerContainer.addEventListener("mouseleave", () => {
      this.isPaused = false; // Resume scrolling
      tickerContainer.setAttribute("data-hovered", "false");
      tickerContainer.setAttribute("data-playing", "true");
    });
  
    // Pause on focus
    tickerContainer.addEventListener("focusin", () => {
      this.wasPausedBeforeFocus = this.isPaused; // Track if it was paused by the user
      this.isPaused = true; // Pause scrolling
      tickerContainer.setAttribute("data-focused", "true");
      tickerContainer.setAttribute("data-playing", "false");
    });
  
    // Resume on blur (only if it wasn't paused by the user)
    tickerContainer.addEventListener("focusout", () => {
      tickerContainer.setAttribute("data-focused", "false");
      if (!this.wasPausedBeforeFocus) {
        this.isPaused = false; // Resume scrolling
        tickerContainer.setAttribute("data-playing", "true");
      }
    });
  }
}