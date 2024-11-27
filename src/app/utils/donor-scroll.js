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
        "Aniko J. donated $103.00 ",
        "Alaine C. donated $36.05 ",
        "Crystal C. donated $154.50 ",
        "Dianne M. donated $51.50 ",
        "David L. donated $72.10 ",
        "Stuart S. donated $10.00 ",
        "John A. donated $154.50 ",
        "Katherine H. donated $30.00 ",
        "Lyn A. donated $18.00 ",
        "Stephanie W. donated $8.00 ",
        "Faith Z. donated $36.05 ",
        "Susan B. donated $55.62 ",
        "Ronald B. donated $100.00 ",
        "Sandra A. donated $30.90 ",
        "Jennifer R. donated $25.75 ",
        "Wendy M. donated $103.00 ",
        "Bonnie E. donated $10.30 ",
        "Linda O. donated $36.05 ",
        "Vicki A. donated $25.75 ",
        "Barbara P. donated $12.00 ",
        "Kathleen W. donated $300.00 ",
        "Severine B. donated $100.00 ",
        "Susan L. donated $50.00 ",
        "Stephanie C. donated $25.75 ",
        "Lynda G. donated $35.00 ",
        "Ruth Marie M. donated $50.00 ",
        "Ann K. donated $51.50 ",
        "Rafael C. donated $20.60 ",
        "Judith H. donated $30.00 ",
        "Francesca K. donated $30.00 ",
        "Ruth R. donated $60.00 ",
        "A.J. S. donated $51.50 ",
        "Elaine C. donated $30.90 ",
        "Lara M. donated $100.00 ",
        "Zora V. donated $257.50 ",
        "Karen B. donated $35.00 ",
        "Russell L. donated $51.50 ",
        "Sue G. donated $25.00 ",
        "Susanne M. donated $25.00 ",
        "Dennis B. donated $30.90 ",
        "James A. donated $51.50 ",
        "Linda K. donated $10.30 ",
        "Luka W. donated $15.00 ",
        "Mary D. donated $51.50 ",
        "Wendy L. donated $30.00 ",
        "Debby R. donated $25.75 ",
        "Suzy G. donated $18.00 ",
        "Inger H. donated $55.00 ",
        "Linda L. donated $20.00 ",
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
      border: 2px solid #132a44;
      margin-bottom: 1rem;
    `;

    const existingTicker = document.querySelector("#donor-ticker");
    if (existingTicker) {
      existingTicker.parentElement.insertBefore(parentContainer, existingTicker);
      parentContainer.appendChild(existingTicker);
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
      background-color: #132a44;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin: 0;
    `;
    pauseButton.setAttribute("type", "button"); // Explicitly set button type

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
    pauseButton.onclick = (event) => {
      event.preventDefault(); // Prevent default behavior
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