import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import FileUpload from './common/FileUpload';
import { WordIcon, ExcelIcon, CopyIcon, CheckIcon } from './icons/Icons';
import { GeneratedProductFeedback } from '../types';
import { generateProductFeedback } from '../services/geminiService';

const ProductFeedback: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [productType, setProductType] = useState<string>('Paint');
  const [description, setDescription] = useState('Chủ đề bức tranh là "Ngôi nhà của em", sử dụng công cụ hình chữ nhật và tô màu.');
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<GeneratedProductFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!studentName || !productType || !file) {
      setError('Vui lòng điền đầy đủ thông tin và tải lên tệp bài làm.');
      return;
    }
    setError('');
    setIsLoading(true);
    setFeedback(null);
    try {
      const result = await generateProductFeedback(studentName, productType, description, file);
      setFeedback(result);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tạo nhận xét. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (!feedback) return;
    const feedbackText = `
Nhận xét chung: ${feedback.general}

Điểm mạnh nổi bật: ${feedback.strengths}

Góp ý cụ thể: ${feedback.suggestions}

Lời khích lệ: ${feedback.encouragement}
    `.trim();
    navigator.clipboard.writeText(feedbackText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const productTypes = ['Word', 'PowerPoint', 'Paint'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Nhận xét Sản phẩm Học sinh">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">1. Nhập tên học sinh</label>
            <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Vd: Nguyễn Văn A" className="w-full bg-slate-700 border border-border-color rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">2. Chọn loại sản phẩm</label>
            <div className="flex gap-2">
              {productTypes.map(type => (
                <button 
                  key={type}
                  onClick={() => setProductType(type)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${productType === type ? 'bg-primary text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">3. Tải lên bài làm</label>
            <FileUpload onFileSelect={setFile} acceptedTypes="image/jpeg,image/png,image/gif" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">4. Mô tả thêm (tùy chọn)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-slate-700 border border-border-color rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" placeholder="Ví dụ: Chủ đề bức tranh là 'Ngôi nhà của em', sử dụng công cụ hình chữ nhật và tô màu."/>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={!file || isLoading} className="w-full">
            Tạo nhận xét
          </Button>
        </div>
      </Card>
      
      <Card title="Kết quả Nhận xét" actions={
        feedback && (
          <>
            <Button variant="secondary" icon={<WordIcon className="w-4 h-4" />}>Word</Button>
            <Button variant="secondary" icon={<ExcelIcon className="w-4 h-4" />}>Excel</Button>
            <Button variant="secondary" onClick={handleCopy} icon={copied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4" />}>
              {copied ? 'Đã chép' : 'Sao chép'}
            </Button>
          </>
        )
      }>
        {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                <svg className="animate-spin h-8 w-8 text-sky-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>AI đang phân tích và tạo nhận xét...</p>
            </div>
        )}
        {feedback && (
          <div className="space-y-4 text-sm text-text-primary">
            <div className="flex items-start gap-4">
              <img src="https://picsum.photos/64" alt="student avatar" className="w-16 h-16 rounded-md object-cover" />
              <div>
                <h3 className="font-bold text-lg">{studentName}</h3>
                <p><strong>Nhận xét chung:</strong> {feedback.general}</p>
              </div>
            </div>
            <div>
              <p><strong>Điểm mạnh nổi bật:</strong> {feedback.strengths}</p>
            </div>
            <div>
              <p><strong>Góp ý cụ thể:</strong></p>
              <div className="whitespace-pre-wrap pl-4 text-text-secondary">{feedback.suggestions}</div>
            </div>
            <div>
              <p><strong>Lời khích lệ:</strong> {feedback.encouragement}</p>
            </div>
          </div>
        )}
        {!isLoading && !feedback && (
          <div className="flex items-center justify-center h-full text-text-secondary text-center">
            <p>Kết quả nhận xét sẽ được hiển thị ở đây sau khi bạn tạo.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductFeedback;