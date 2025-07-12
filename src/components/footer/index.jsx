import React from 'react';

const Footer = () => (
  <footer className="bg-gray-100 text-gray-700 py-8 border-t border-gray-200 shadow-inner">
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
      {/* About */}
      <div className="flex flex-col items-center justify-baseline">
        <h3 className="text-xl font-semibold mb-2">Về Chúng Tôi</h3>
        <p className="text-l">
          Hệ thống hỗ trợ phòng chống ma túy – nền tảng trực tuyến cung cấp nội dung giáo dục,
           
        </p>
        <p className="text-l">
          
            đánh giá rủi ro ASSIST/CRAFFT, đặt lịch tư vấn và chương trình phòng ngừa cộng đồng.
        </p>
      </div>

      {/* Contact */}
      <div className="flex flex-col items-start justify-self-start pl-8">
        <h3 className="text-xl font-semibold mb-2">Liên Hệ</h3>
        <ul className="space-y-1 text-sm flex flex-col items-start justify-self-start">
          <li>Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TP. HCM</li>
          <li>Email: <a href="mailto:phucnbse180287@fpt.edu.vn" className="hover:text-blue-950">phucnbse180287@fpt.edu.vn</a></li>
          <li>Điện thoại: <a href="tel:+84123456789" className="hover:text-blue-950">+84 123 456 789</a></li>
        </ul>
      </div>
    </div>

    <div className="mt-8 border-t border-gray-700 pt-4 text-center text-xs text-gray-500">
      &copy; {new Date().getFullYear()} Drug Prevention - Vì một tương lai không ma túy.
    </div>
  </footer>
);

export default Footer;
