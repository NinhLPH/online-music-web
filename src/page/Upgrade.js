import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Upgrade() {
  const { currentUser, updateSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleUpgrade = () => {
    setLoading(true);

    setTimeout(() => {
      updateSubscription({
        tier: "premium",
        status: "active",
        expiresAt: "2099-12-31"
      });

      setLoading(false);
      setToast("🎉 Nâng cấp Premium thành công!");
      setTimeout(() => setToast(null), 2500);

      setTimeout(() => navigate("/home"), 1500);
    }, 1500);
  };

  if (!currentUser) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <h3 style={{ color: "#fff" }}>Bạn cần đăng nhập để nâng cấp Premium!</h3>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#121212",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: "650px",
        width: "100%"
      }}>
        <div style={{
          textAlign: "center",
          marginBottom: "40px"
        }}>
          <div style={{
            fontSize: "3.5rem",
            marginBottom: "10px"
          }}>👑</div>
          <h1 style={{
            color: "#fff",
            fontSize: "2.5rem",
            margin: "0 0 15px 0",
            fontWeight: "700",
            letterSpacing: "-0.5px"
          }}>
            Nâng cấp Premium
          </h1>
          <p style={{
            color: "#b3b3b3",
            fontSize: "1.1rem",
            margin: 0
          }}>
            Trải nghiệm âm nhạc không giới hạn
          </p>
        </div>

        <div style={{
          backgroundColor: "#181818",
          border: "2px solid #282828",
          borderRadius: "16px",
          padding: "45px 40px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #1db954, #1ed760, #1db954)",
            backgroundSize: "200% 100%",
            animation: "gradient 3s ease infinite"
          }} />

          <div style={{
            display: "inline-block",
            backgroundColor: "#ffc107",
            color: "#000",
            padding: "8px 20px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: "bold",
            marginBottom: "25px",
            letterSpacing: "0.5px"
          }}>
            ⭐ GÓI PREMIUM
          </div>

          <h2 style={{
            color: "#fff",
            fontSize: "1.6rem",
            marginBottom: "30px",
            fontWeight: "600"
          }}>
            Quyền lợi của bạn
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            marginBottom: "35px"
          }}>
            {[{ emoji: "🚫", title: "Không quảng cáo", desc: "Nghe nhạc liên tục" },
              { emoji: "🎵", title: "Toàn bộ Premium", desc: "Mọi bài hát cao cấp" },
              { emoji: "📥", title: "Tải về offline", desc: "Nghe mọi lúc mọi nơi" },
              { emoji: "🎧", title: "Chất lượng cao", desc: "Âm thanh siêu nét" }
            ].map((feature, index) => (
              <div key={index} style={{
                backgroundColor: "#282828",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #333",
                transition: "all 0.3s ease",
                cursor: "default"
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2a2a2a";
                  e.currentTarget.style.borderColor = "#1db954";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#282828";
                  e.currentTarget.style.borderColor = "#333";
                  e.currentTarget.style.transform = "translateY(0)";
                }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                  {feature.emoji}
                </div>
                <div style={{
                  color: "#fff",
                  fontWeight: "600",
                  marginBottom: "4px",
                  fontSize: "1rem"
                }}>
                  {feature.title}
                </div>
                <div style={{
                  color: "#b3b3b3",
                  fontSize: "0.85rem"
                }}>
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            backgroundColor: "#282828",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "30px",
            border: "1px solid #333"
          }}>
            <div style={{
              color: "#b3b3b3",
              fontSize: "0.95rem",
              marginBottom: "10px"
            }}>
              Chỉ với
            </div>
            <div style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: "8px"
            }}>
              <span style={{
                fontSize: "3.5rem",
                fontWeight: "bold",
                color: "#1db954",
                lineHeight: 1
              }}>
                $4.99
              </span>
              <span style={{
                fontSize: "1.2rem",
                color: "#b3b3b3"
              }}>
                / tháng
              </span>
            </div>
            <div style={{
              marginTop: "12px",
              color: "#ffc107",
              fontSize: "0.9rem",
              fontWeight: "500"
            }}>
              💰 Hủy bất cứ lúc nào
            </div>
          </div>

          <button
            disabled={loading}
            onClick={handleUpgrade}
            style={{
              width: "100%",
              padding: "18px",
              backgroundColor: loading ? "#555" : "#1db954",
              color: loading ? "#999" : "#fff",
              fontWeight: "bold",
              fontSize: "1.1rem",
              border: "none",
              borderRadius: "50px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: loading ? "none" : "0 4px 20px rgba(29, 185, 84, 0.4)",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#1ed760";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 25px rgba(29, 185, 84, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#1db954";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 20px rgba(29, 185, 84, 0.4)";
              }
            }}
          >
            {loading ? (
              <span>
                <span style={{
                  display: "inline-block",
                  animation: "spin 1s linear infinite"
                }}>⏳</span>
                {" "}Đang xử lý...
              </span>
            ) : (
              "Thanh toán ngay"
            )}
          </button>

          <div style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#b3b3b3",
            fontSize: "0.85rem"
          }}>
            🔒 Thanh toán an toàn và bảo mật
          </div>
        </div>

        <div style={{
          textAlign: "center",
          marginTop: "25px",
          color: "#888",
          fontSize: "0.9rem"
        }}>
          Có câu hỏi? <span style={{ color: "#1db954", cursor: "pointer" }}>Liên hệ hỗ trợ</span>
        </div>
      </div>

      {toast && (
        <div style={{
          position: "fixed",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg, #1db954 0%, #1ed760 100%)",
          padding: "16px 32px",
          borderRadius: "12px",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1rem",
          boxShadow: "0 8px 32px rgba(29, 185, 84, 0.4)",
          animation: "slideUp 0.4s ease",
          zIndex: 3000,
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ fontSize: "1.5rem" }}>✓</span>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
