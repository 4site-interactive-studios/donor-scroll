import DonorScroll from "./app/app";
//run();
window.DonorScroll = DonorScroll;
window.addEventListener("load", function () {
  let donorScroll = new DonorScroll();
  // Set default options
  // if (typeof window.DonationLightboxOptions !== "undefined") {
  //   donationLightbox.setOptions(window.DonationLightboxOptions);
  // }
});
