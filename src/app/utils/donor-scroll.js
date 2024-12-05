const shuffleSeed = require("shuffle-seed");

export class DonorScroll {
  constructor() {
    if (
      !document.querySelector(".donor-list") &&
      !document.querySelector("#donor-ticker")
    )
      return;

    this.donors = [];
    // Retrieve saved state from localStorage
    const savedState = this.getLocalStorage("tickerState");
    // Set initial state and label
    this.isPaused = savedState === "paused";
    this.layout = "normal";
    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion)"
    ).matches;

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
        if (this.prefersReducedMotion) {
          this.isPaused = true;
        }
        this.createTickerContainer();
        this.displayDonations(this.getDonors());
        this.addAccessibilityControls();
        this.addHoverAndFocusControls();
      });
    } else {
      if (this.prefersReducedMotion) {
        this.isPaused = true;
      }
      this.createTickerContainer();
      this.displayDonations(this.getDonors());
      this.addAccessibilityControls();
      this.addHoverAndFocusControls();
    }
  }

  createTickerContainer() {
    const parentContainer = document.createElement("div");
    parentContainer.id = "ticker-container";

    const existingTicker = document.querySelector("#donor-ticker");
    if (existingTicker) {
      existingTicker.dataset.playing = this.isPaused ? "false" : "true";
      if ("layout" in existingTicker.dataset) {
        this.layout = existingTicker.dataset.layout;
        parentContainer.dataset.layout = this.layout;
      }
      // If layout is full, add parent container to #engrid
      if (this.layout === "full") {
        const engrid = document.querySelector("#engrid");
        if (engrid) {
          parentContainer.appendChild(existingTicker);
          engrid.appendChild(parentContainer);
        }
      } else {
        // Otherwise, add parent container before the existing
        existingTicker.parentElement.insertBefore(
          parentContainer,
          existingTicker
        );
        parentContainer.appendChild(existingTicker);
      }
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
    pauseButton.setAttribute("type", "button"); // Explicitly set button type

    pauseButton.innerText = this.isPaused ? "Play" : "Pause";
    pauseButton.setAttribute(
      "aria-label",
      this.isPaused ? "Play scrolling" : "Pause scrolling"
    );
    pauseButton.setAttribute("tabindex", "0"); // Ensure button is focusable

    // Append the button to the container
    parentContainer.insertAdjacentElement("afterbegin", pauseButton);

    // Add toggle functionality
    pauseButton.onclick = () => {
      this.togglePauseScrolling(); // Toggle pause state
    };
  }

  togglePauseScrolling() {
    const pauseButton = document.querySelector("#ticker-container button");
    if (!pauseButton) return;
    this.isPaused = !this.isPaused;

    // Update label and aria-label
    pauseButton.innerText = this.isPaused ? "Play" : "Pause";
    pauseButton.setAttribute(
      "aria-label",
      this.isPaused ? "Play scrolling" : "Pause scrolling"
    );

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
  }

  addHoverAndFocusControls() {
    const tickerContainer = document.querySelector("#donor-ticker");
    if (!tickerContainer) return;

    // Ensure ticker is focusable for keyboard navigation
    tickerContainer.setAttribute("tabindex", "0");

    // Track whether the user explicitly paused the ticker
    let userPaused = this.isPaused;

    // Pause on hover and update data-hovered
    tickerContainer.addEventListener("mouseenter", () => {
      if (!this.isPaused) {
        this.isPaused = true; // Temporarily pause scrolling
        tickerContainer.setAttribute("data-hovered", "true");
        tickerContainer.setAttribute("data-playing", "false");
      }
    });

    tickerContainer.addEventListener("mouseleave", () => {
      tickerContainer.setAttribute("data-hovered", "false");
      if (!userPaused) {
        this.isPaused = false; // Resume scrolling only if not paused by the user
        tickerContainer.setAttribute("data-playing", "true");
      }
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
      if (!this.wasPausedBeforeFocus && !userPaused) {
        this.isPaused = false; // Resume scrolling
        tickerContainer.setAttribute("data-playing", "true");
      }
    });

    // Update userPaused state on button click
    const pauseButton = document.querySelector("#ticker-container button");
    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        userPaused = this.isPaused;
      });
    }
  }
}
