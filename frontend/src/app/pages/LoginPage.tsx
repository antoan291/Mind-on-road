import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{
        background:
          "radial-gradient(circle at center, rgba(100, 116, 255, 0.12), transparent 26%), linear-gradient(180deg, #131a2b 0%, #171f31 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <section
          className="rounded-[24px] border px-8 py-9 shadow-[0_28px_80px_rgba(4,10,24,0.54)]"
          style={{
            background: "rgba(35, 45, 66, 0.94)",
            borderColor: "rgba(100, 118, 151, 0.18)",
          }}
        >
          <header className="text-center">
            <h1
              className="text-[2.1rem] font-semibold tracking-[-0.04em]"
              style={{ color: "#6f75ff" }}
            >
              DriveAdmin
            </h1>
            <p
              className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "rgba(143, 122, 255, 0.82)" }}
            >
              • AI-POWERED CRM
            </p>
          </header>

          <div
            className="my-7 h-px"
            style={{ background: "rgba(126, 142, 175, 0.15)" }}
          />

          <div>
            <h2
              className="text-[1.5rem] font-semibold"
              style={{ color: "rgba(241, 245, 255, 0.92)" }}
            >
              Вход в системата
            </h2>

            <form className="mt-8 space-y-6">
              <label className="block">
                <span
                  className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "rgba(133, 145, 170, 0.72)" }}
                >
                  Имейл или телефон
                </span>
                <input
                  type="text"
                  placeholder="example@school.bg"
                  value={formData.identifier}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      identifier: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-[12px] border px-4 text-sm outline-none transition"
                  style={{
                    background: "rgba(18, 24, 41, 0.96)",
                    borderColor: "rgba(98, 112, 143, 0.22)",
                    color: "rgba(228, 233, 247, 0.94)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                  }}
                />
              </label>

              <label className="block">
                <span
                  className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "rgba(133, 145, 170, 0.72)" }}
                >
                  Парола
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-[12px] border px-4 pr-12 text-sm outline-none transition"
                    style={{
                      background: "rgba(18, 24, 41, 0.96)",
                      borderColor: "rgba(98, 112, 143, 0.22)",
                      color: "rgba(228, 233, 247, 0.94)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full"
                    style={{ color: "rgba(161, 173, 199, 0.82)" }}
                    aria-label={
                      showPassword ? "Скрий паролата" : "Покажи паролата"
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium transition"
                  style={{ color: "#6570ff" }}
                >
                  Забравена парола?
                </button>
              </div>

              <button
                type="submit"
                className="h-12 w-full rounded-[12px] text-sm font-semibold transition-transform active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(90deg, #6564eb 0%, #6e73ff 50%, #6864eb 100%)",
                  color: "#f8f8ff",
                  boxShadow: "0 18px 34px rgba(84, 92, 240, 0.22)",
                }}
              >
                Вход
              </button>
            </form>
          </div>
        </section>

        <p
          className="mt-7 text-center text-xs"
          style={{ color: "rgba(111, 123, 145, 0.72)" }}
        >
          © 2026 DriveAdmin
        </p>
      </div>
    </main>
  );
}
