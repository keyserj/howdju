// TODO(#196): ensure that these paths follow a pattern compatible with the web app paths. Maybe
// move all paths here so that the extension and mobile app can access them.
module.exports.CommonPaths = class CommonPaths {
  confirmRegistration() {
    return "/complete-registration";
  }
  confirmPasswordReset() {
    return "/reset-password";
  }
  login() {
    return "/login";
  }
  requestPasswordReset() {
    return "/request-password-reset";
  }
  searchMediaExcerpts() {
    return "/search-media-excerpts";
  }
};

module.exports.commonPaths = new module.exports.CommonPaths();
