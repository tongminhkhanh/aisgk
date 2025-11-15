import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-sky-400">
        Công cụ AI Tạo Câu hỏi SGK
      </h1>
      <p className="text-text-secondary mt-2">
        Tác giả: Tòng Minh Khánh, trường Tiểu học Ít Ong, xã Mường La, tỉnh Sơn La
      </p>
    </header>
  );
};

export default Header;