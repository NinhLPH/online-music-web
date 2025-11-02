import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer
      className="text-secondary pt-4 px-5"
      style={{
        backgroundColor: "#0d0d0d",
        borderTop: "1px solid #222",
        fontSize: "14px",
      }}
    >
      {/* ------- Top section ------- */}
      <div className="row mb-4">
        <div className="col-6 col-md-3 mb-3">
          <h6 className="text-white">PNQ Music</h6>
          <ul className="list-unstyled">
            <li><a href="#" className="text-secondary text-decoration-none">Giới thiệu</a></li>
            <li><a href="#" className="text-secondary text-decoration-none">Tuyển dụng</a></li>
            <li><a href="#" className="text-secondary text-decoration-none">Tin tức</a></li>
          </ul>
        </div>

        <div className="col-6 col-md-3 mb-3">
          <h6 className="text-white">Cộng đồng</h6>
          <ul className="list-unstyled">
            <li><a href="#" className="text-secondary text-decoration-none">Nghệ sĩ</a></li>
            <li><a href="#" className="text-secondary text-decoration-none">Nhà phát triển</a></li>
            <li><a href="#" className="text-secondary text-decoration-none">Quảng cáo</a></li>
            <li><a href="#" className="text-secondary text-decoration-none">Nhà đầu tư</a></li>
            <li><a href="#" className="text-secondary text-decoration-none">Đối tác</a></li>
          </ul>
        </div>

        <div className="col-6 col-md-3 mb-3">
          <h6 className="text-white">Liên kết hữu ích</h6>
          <ul className="list-unstyled">
            <li><a href="#" className="text-secondary text-decoration-none">Hỗ trợ</a></li>
            <li><a href="#" className="text-secondary text-decoration-none">Ứng dụng điện thoại</a></li>
            <li><a href="#" className="text-secondary text-decoration-none">Âm nhạc thịnh hành</a></li>
            <li><a href="#" className="text-secondary text-decoration-none">Đăng tải âm nhạc</a></li>
          </ul>
        </div>

        <div className="col-6 col-md-3 mb-3">
          <h6 className="text-white">Gói PNQ</h6>
          <ul className="list-unstyled">
            <li><a href="#" className="text-secondary text-decoration-none">Premium Cá nhân</a></li>
            <li><a href="#" className="text-secondary text-decoration-none">Premium Sinh viên</a></li>
            <li><a href="#" className="text-secondary text-decoration-none">PNQ Free</a></li>
          </ul>
        </div>

        {/* Social Icons */}
        <div className="mt-3 d-flex gap-3">
          <a href="#" className="text-secondary">
            <FaInstagram size={22} />
          </a>
          <a href="#" className="text-secondary">
            <FaTwitter size={22} />
          </a>
          <a href="#" className="text-secondary">
            <FaFacebookF size={22} />
          </a>
        </div>
      </div>

      <hr style={{ borderColor: "#222" }} />

      {/* ------- Bottom section ------- */}
      <div className="d-flex justify-content-between align-items-center pb-3 flex-wrap gap-2">
        <div className="d-flex gap-3 flex-wrap">
          <a href="#" className="text-secondary text-decoration-none small">Điều khoản</a>
          <a href="#" className="text-secondary text-decoration-none small">Trung tâm bảo mật</a>
          <a href="#" className="text-secondary text-decoration-none small">Chính sách bảo mật</a>
          <a href="#" className="text-secondary text-decoration-none small">Cookies</a>
          <a href="#" className="text-secondary text-decoration-none small">Quảng cáo</a>
          <a href="#" className="text-secondary text-decoration-none small">Trợ năng</a>
        </div>

        <span className="small">© 2025 PNQ Music</span>
      </div>
    </footer>
  );
}

export default Footer;
