
import React from 'react';
import Card from './common/Card';

const RegularFeedback: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <Card title="Bảng điều khiển">
                <div className="flex items-center justify-center h-full text-text-secondary">
                    <p>Tính năng này đang được phát triển.</p>
                </div>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card title="Danh sách học sinh">
                <div className="flex items-center justify-center h-full text-text-secondary">
                    <p>Danh sách sẽ hiển thị ở đây.</p>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default RegularFeedback;
