
import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { GeneratedTextQuestionResponse } from '../types';
import { generateQuestionsFromText } from '../services/geminiService';

const TextQuestionGenerator: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<GeneratedTextQuestionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!inputText.trim()) {
            setError('Vui lòng nhập nội dung văn bản.');
            return;
        }
        setError('');
        setIsLoading(true);
        setResult(null);
        try {
            const response = await generateQuestionsFromText(inputText);
            setResult(response);
        } catch (err) {
            setError('Đã xảy ra lỗi khi tạo câu hỏi. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Nhập nội dung văn bản">
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary">Dán một đoạn nội dung từ sách giáo khoa hoặc tài liệu vào đây. AI sẽ tóm tắt và tạo câu hỏi bám sát nội dung.</p>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        rows={15}
                        className="w-full bg-slate-700 border border-border-color rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                        placeholder="Dán nội dung văn bản ở đây..."
                    />
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading || !inputText.trim()} className="w-full">
                        Tạo tóm tắt và câu hỏi
                    </Button>
                </div>
            </Card>

            <Card title="Kết quả">
                 <div className="h-[450px] overflow-y-auto pr-2 -mr-2">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                            <svg className="animate-spin h-8 w-8 text-sky-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p>AI đang phân tích văn bản...</p>
                        </div>
                    )}
                    {result && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-sky-400 mb-2">Tóm tắt nội dung</h3>
                                <p className="text-text-primary bg-slate-900/50 p-3 rounded-md">{result.summary}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-sky-400 mb-2">Câu hỏi đề xuất</h3>
                                <div className="space-y-4">
                                     {result.questions.map((q, index) => (
                                        <div key={index} className="text-sm bg-slate-900/50 p-3 rounded-md">
                                            <p className="font-semibold">{index + 1}. {q.question}</p>
                                            {q.type === 'multiple_choice' && (
                                                 <ul className="pl-6 mt-1 space-y-1 list-none">
                                                    {q.options?.map((option, oIndex) => (
                                                        <li key={oIndex} className={option === q.correctAnswer ? 'text-green-400 font-semibold' : ''}>
                                                           {String.fromCharCode(65 + oIndex)}. {option}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {!isLoading && !result && (
                      <div className="flex items-center justify-center h-full text-text-secondary text-center">
                        <p>Kết quả tóm tắt và câu hỏi sẽ được hiển thị ở đây.</p>
                      </div>
                    )}
                 </div>
            </Card>
        </div>
    );
};

export default TextQuestionGenerator;
