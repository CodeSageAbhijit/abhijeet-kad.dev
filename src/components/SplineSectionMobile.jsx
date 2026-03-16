const SplineSectionMobile = () => {
  return (
    <section
      style={{
        width: "100%",
        padding: "42px 16px 28px",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          margin: "0 auto",
          border: "1px solid rgba(158,255,0,0.18)",
          background:
            "linear-gradient(140deg, rgba(8,12,10,0.94), rgba(10,18,12,0.9))",
          boxShadow: "0 0 24px rgba(158,255,0,0.08)",
          borderRadius: 14,
          padding: "20px 16px",
        }}
      >
        <p
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            color: "rgba(158,255,0,0.62)",
            letterSpacing: 2.4,
            marginBottom: 8,
          }}
        >
          // mobile optimized
        </p>

        <h3
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(28px, 9vw, 40px)",
            color: "#ffffff",
            letterSpacing: 3,
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          Mini-Game On Desktop
        </h3>

        <p
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 12,
            color: "rgba(220,255,230,0.66)",
            lineHeight: 1.55,
            marginBottom: 14,
          }}
        >
          Mobile view skips the interactive Spline game for better performance
          and smoother scrolling. Open on desktop to play the full version.
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid rgba(158,255,0,0.3)",
            padding: "8px 10px",
            borderRadius: 8,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            color: "#9eff00",
            letterSpacing: 1,
          }}
        >
          <span>[desktop-only]</span>
          <span style={{ color: "rgba(158,255,0,0.45)" }}>interactive module</span>
        </div>
      </div>
    </section>
  );
};

export default SplineSectionMobile;
