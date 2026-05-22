import { supabase } from "./supabase";

export default function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error("Login error:", error);
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f3ef",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      {/* Logo */}
      <div style={{
        fontSize: 42,
        fontWeight: 700,
        letterSpacing: -1,
        marginBottom: 8,
        color: "#1a1a1a",
      }}>
        UofT<span style={{ color: "#ff6b6b" }}>Eats</span>
      </div>

      <p style={{
        fontSize: 15,
        color: "#888",
        marginBottom: 40,
        textAlign: "center",
        maxWidth: 300,
      }}>
        The food discovery map for UofT students
      </p>

      {/* Card */}
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: "36px 40px",
        width: 340,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 6,
          color: "#1a1a1a",
        }}>
          Sign in
        </h2>
        <p style={{
          fontSize: 13,
          color: "#aaa",
          marginBottom: 28,
        }}>
          Use your Google account to continue
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            padding: "12px 20px",
            borderRadius: 10,
            border: "1px solid #e8e8e8",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            color: "#333",
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => e.target.style.background = "#fafafa"}
          onMouseLeave={e => e.target.style.background = "white"}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{
          fontSize: 11,
          color: "#ccc",
          marginTop: 20,
          lineHeight: 1.6,
        }}>
          By signing in you agree to our terms of service.
          Vetted student groups can add food locations.
        </p>
      </div>

      {/* Browse without account */}
      <button
        onClick={() => window.location.href = "/"}
        style={{
          marginTop: 20,
          background: "none",
          border: "none",
          color: "#aaa",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "underline",
        }}
      >
        Browse map without signing in →
      </button>
    </div>
  );
}
