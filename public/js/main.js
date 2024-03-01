class User {
  static accessToken = null;
  static user = null;

  static init() {
    $("body").on("click", "#action-logout", () => {
      this.logout();
    });
    const raw = localStorage.getItem("token");
    if (!raw) return;
    this.accessToken = raw;
  }

  static setToken(token) {
    this.accessToken = token;
    localStorage.setItem("token", this.accessToken);
  }

  static async autoLogin() {
    if (!this.accessToken) return;
    try {
      const response = await axios.post(`/token`, {
        token: this.accessToken,
      });
      const data = response.data.data;
      console.log("Account", data.account);
      this.user = data.account;
      this.renderUserComponent();
    } catch (e) {
      console.error(e);
    }
  }

  static logout() {
    localStorage.removeItem("token");
    this.accessToken = null;
    window.location.reload();
  }

  static renderUserComponent() {
    const isLogged = this.user != null;
    $("#user-header").remove();
    $("body").prepend(
      $("<div>", { id: "user-header" }).html(`
    User ${this.user?.login ?? "Guest"} ${
        isLogged
          ? '<button id="action-logout">Logout</button>'
          : `<a href="/auth/signin.html"><button>Log in</button></a>`
      }`)
    );
  }
}

$(document).ready(() => {
  User.init();
  User.autoLogin();
});
