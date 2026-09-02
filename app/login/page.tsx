import { Input } from "@/components/input";

export default function LoginPage() {
  return (
    <div id="login-page" className="login-page">
      <div className="w-full">
        <div className="w-full flex flex-col items-center justify-center">
          <div className="login-shell ios-glass-card">
            <div className="login-card">
              <header className="login-header">
                <h1 id="login-title" className="login-header__title">
                  <img src="/images/logo.png" alt="USA Farm Agri" className="login-header__logo" />
                </h1>
              </header>

              <form id="login-form" action="/login" method="post" className="login-form">
                <Input
                  id="identity"
                  name="username"
                  type="text"
                  label="Email hoặc tên đăng nhập *"
                  placeholder="mail@congty.com"
                  autoComplete="username"
                  required
                />

                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Mật khẩu *"
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="current-password"
                  minLength={6}
                  required
                />

                <div className="login-form__meta">
                  <a href="#" className="login-link" tabIndex={-1}>
                    Quên mật khẩu?
                  </a>
                </div>

                <button type="submit" id="login-submit" className="login-submit">
                  Đăng nhập
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
