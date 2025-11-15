
import React from 'react';
import Card from './common/Card';

const PeriodicAssessment: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Nhận xét định kì">
         <div className="flex items-center justify-center h-full text-text-secondary">
            <p>Tính năng này đang được phát triển.</p>
        </div>
      </Card>
      <Card title="Kết quả Nhận xét">
        <div className="flex items-center justify-center h-full text-text-secondary">
            <p>Kết quả sẽ hiển thị ở đây.</p>
        </div>
      </Card>
    </div>
  );
};

export default PeriodicAssessment;
