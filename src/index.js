import DonorScroll from "./app/app";
import "./scss/main.scss";
//run();
window.DonorScroll = DonorScroll;
window.addEventListener("load", function () {
  let donorScroll = new DonorScroll();
  // Set default options
  // if (typeof window.DonationLightboxOptions !== "undefined") {
  //   donationLightbox.setOptions(window.DonationLightboxOptions);
  // }
});
