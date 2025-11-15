
import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import FileUpload from './common/FileUpload';
import { WordIcon, CopyIcon, CheckIcon } from './icons/Icons';
import { GeneratedQuestionLevel, QuestionCounts } from '../types';
import { generateQuestionsFromTextbook, suggestTopicFromFile } from '../services/geminiService';

const TOPIC_SUGGESTIONS: { [key: string]: string[] } = {
  'Tiếng Việt': [
    'Tập đọc: Dế Mèn bênh vực kẻ yếu',
    'Chính tả: Mười năm cõng bạn đi học',
    'Luyện từ và câu: Mở rộng vốn từ Nhân hậu - Đoàn kết',
    'Kể chuyện: Sự tích hồ Ba Bể',
    'Tập làm văn: Viết thư',
    'Danh từ, động từ, tính từ',
    'Câu kể Ai là gì?',
  ],
  'Toán': [
    'Ôn tập và bổ sung',
    'Phép cộng, phép trừ trong phạm vi 1000',
    'Các số đến 10 000',
    'Bảng cửu chương',
    'Hình vuông, hình chữ nhật',
    'Giải toán có lời văn',
    'Làm quen với thống kê, xác suất',
  ],
  'Đạo đức': [
      'Kính trọng thầy cô, yêu quý bạn bè',
      'Giữ gìn trường lớp sạch đẹp',
      'An toàn giao thông',
      'Biết ơn cha mẹ, ông bà',
      'Thật thà trong học tập',
      'Tôn trọng sự khác biệt',
  ],
  'Tiếng Anh': [
      'Greetings and Introductions',
      'Family members',
      'Animals',
      'Colors and Shapes',
      'My Classroom',
      'Food and Drinks',
      'Toys and Hobbies',
  ],
  'Tự nhiên và Xã hội': [
    'Chủ đề: Gia đình',
    'Chủ đề: Trường học',
    'Chủ đề: Cộng đồng địa phương',
    'Chủ đề: Thực vật và động vật',
    'Chủ đề: Con người và sức khỏe',
    'Chủ đề: Trái đất và bầu trời',
  ],
  'Lịch sử và Địa lý': [
      'Vua Hùng dựng nước',
      'Hai Bà Trưng',
      'Chiến thắng Bạch Đằng',
      'Bản đồ Việt Nam',
      'Thủ đô Hà Nội',
      'Thành phố Hồ Chí Minh',
      'Các dân tộc Việt Nam',
  ],
  'Khoa học': [
      'Vòng tuần hoàn của nước',
      'Sự lớn lên của cây',
      'Các chất dinh dưỡng',
      'Phòng tránh bệnh tật',
      'Năng lượng mặt trời',
      'Không khí và sự cháy',
      'Âm thanh và ánh sáng',
  ],
  'Tin học': [
    'Bài 1: Máy tính và em',
    'Bài 2: Bắt đầu với máy tính',
    'Bài 3: Chuột máy tính',
    'Bài 4: Bàn phím máy tính',
    'Bài 5: Bản quyền nội dung thông tin',
    'Chủ đề A: Máy tính và em',
    'Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính',
  ],
  'Công nghệ': [
      'Sử dụng đồ dùng học tập an toàn',
      'Làm đồ chơi từ vật liệu tái chế',
      'Trồng cây trong chậu',
      'Lắp ghép mô hình đơn giản',
      'An toàn trong gia đình',
  ],
  'Giáo dục thể chất': [
      'Đội hình đội ngũ',
      'Bài tập thể dục buổi sáng',
      'Các trò chơi vận động',
      'Ném bóng trúng đích',
      'Nhảy dây',
      'Bơi lội cơ bản',
  ],
  'Âm nhạc': [
      'Hát đúng giai điệu, lời ca',
      'Vận động theo nhạc',
      'Nhận biết các nốt nhạc cơ bản',
      'Giới thiệu một số nhạc cụ dân tộc',
      'Nghe và cảm thụ âm nhạc',
  ],
  'Mỹ thuật': [
      'Vẽ tranh đề tài tự do',
      'Nặn con vật em yêu thích',
      'Tạo hình từ lá cây',
      'Trang trí đồ vật',
      'Tìm hiểu về màu sắc',
  ],
  'Hoạt động trải nghiệm': [
      'Tổ chức sinh nhật cho bạn',
      'Làm vệ sinh lớp học',
      'Tham quan trường em',
      'Tìm hiểu về nghề nghiệp của bố mẹ',
      'Kỹ năng giao tiếp, ứng xử',
  ]
};


const QuestionGenerator: React.FC = () => {
    const [subject, setSubject] = useState('Tin học');
    const [grade, setGrade] = useState('5');
    const [topic, setTopic] = useState('Bài 5. Bản quyền nội dung thông tin');
    const [questionCounts, setQuestionCounts] = useState<QuestionCounts>({
        level1: { mcq: 2, essay: 1 },
        level2: { mcq: 2, essay: 1 },
        level3: { mcq: 1, essay: 1 },
    });
    const [file, setFile] = useState<File | null>(null);
    const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionLevel[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
    const [isTopicsLoading, setIsTopicsLoading] = useState(false);
    const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
    const [isSuggestingTopic, setIsSuggestingTopic] = useState(false);

    useEffect(() => {
        setIsTopicsLoading(true);
        // Simulate fetching topics
        const timer = setTimeout(() => {
            // Only set default suggestions if no file is selected
            if (!file) {
                setTopicSuggestions(TOPIC_SUGGESTIONS[subject] || []);
            }
            setIsTopicsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [subject, file]);
    
    const handleFileSelect = async (selectedFile: File | null) => {
        setFile(selectedFile);
        if (selectedFile) {
            setIsSuggestingTopic(true);
            setTopic(''); // Clear previous topic to show placeholder
            try {
                const suggestedTopics = await suggestTopicFromFile(selectedFile);
                if (suggestedTopics && suggestedTopics.length > 0) {
                    setTopicSuggestions(suggestedTopics);
                    setTopic(suggestedTopics[0]); // Set the first suggestion as the current topic
                } else {
                    // If no topics found, revert to subject-based suggestions
                    setTopicSuggestions(TOPIC_SUGGESTIONS[subject] || []);
                }
            } catch (e) {
                console.error("Failed to suggest topic from file", e);
                // Revert to subject-based suggestions on error
                setTopicSuggestions(TOPIC_SUGGESTIONS[subject] || []);
            } finally {
                setIsSuggestingTopic(false);
            }
        } else {
             // If file is cleared, revert to subject-based suggestions
            setTopicSuggestions(TOPIC_SUGGESTIONS[subject] || []);
            setTopic('');
        }
    };

    const handleCountChange = (level: string, type: 'mcq' | 'essay', value: string) => {
        const numValue = parseInt(value, 10);
        if (numValue >= 0) {
            setQuestionCounts(prev => ({
                ...prev,
                [level]: {
                    ...prev[level],
                    [type]: numValue,
                }
            }));
        }
    };

    const handleSubmit = async () => {
        setError('');
        setIsLoading(true);
        setGeneratedQuestions(null);
        try {
            const result = await generateQuestionsFromTextbook(subject, grade, topic, questionCounts, file);
            setGeneratedQuestions(result);
        } catch (err) {
            setError('Đã xảy ra lỗi khi tạo câu hỏi. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatQuestionsToText = (levels: GeneratedQuestionLevel[] | null) => {
        if (!levels) return '';
        return levels.map(level => {
            const mcqs = level.questions.filter(q => q.type === 'multiple_choice');
            const essays = level.questions.filter(q => q.type === 'essay');

            let levelText = `--- ${level.levelName.toUpperCase()} ---\n\n`;

            if (mcqs.length > 0) {
                levelText += 'A. TRẮC NGHIỆM\n';
                mcqs.forEach((q, i) => {
                    levelText += `${i + 1}. ${q.question}\n`;
                    q.options?.forEach(opt => levelText += `   - ${opt}\n`);
                    levelText += `   => Đáp án đúng: ${q.correctAnswer}\n\n`;
                });
            }

            if (essays.length > 0) {
                levelText += 'B. TỰ LUẬN\n';
                essays.forEach((q, i) => {
                    levelText += `${i + 1}. ${q.question}\n\n`;
                });
            }

            return levelText;
        }).join('\n');
    };

    const handleCopy = (key: string, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
    };

    const QuestionLevelInput: React.FC<{ level: string; levelName: string; }> = ({ level, levelName }) => (
        <div>
            <p className="font-semibold text-text-primary mb-2">{levelName}</p>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Trắc nghiệm</label>
                    <input type="number" min="0" value={questionCounts[level].mcq} onChange={(e) => handleCountChange(level, 'mcq', e.target.value)} className="w-full bg-slate-700 border border-border-color rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Tự luận</label>
                    <input type="number" min="0" value={questionCounts[level].essay} onChange={(e) => handleCountChange(level, 'essay', e.target.value)} className="w-full bg-slate-700 border border-border-color rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
                </div>
            </div>
        </div>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Tạo câu hỏi từ Sách giáo khoa">
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Môn học</label>
                    <select value={subject} onChange={(e) => { setSubject(e.target.value); setTopic(''); }} className="w-full bg-slate-700 border border-border-color rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none">
                        {Object.keys(TOPIC_SUGGESTIONS).map(subj => (
                            <option key={subj} value={subj}>{subj}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Lớp</label>
                     <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-slate-700 border border-border-color rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none">
                        {[1, 2, 3, 4, 5].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Chủ đề/Bài học (tùy chọn)</label>
                <input 
                    type="text" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                    className="w-full bg-slate-700 border border-border-color rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none disabled:bg-slate-800 disabled:cursor-wait" 
                    list="topic-suggestions"
                    placeholder={isTopicsLoading ? "Đang tải gợi ý..." : isSuggestingTopic ? "Đang phân tích tệp..." : "Nhập hoặc chọn một chủ đề"}
                    disabled={isTopicsLoading || isSuggestingTopic}
                />
                <datalist id="topic-suggestions">
                    {topicSuggestions.map((suggestion, index) => (
                        <option key={index} value={suggestion} />
                    ))}
                </datalist>
            </div>
            <div className="space-y-3 pt-2">
                <h3 className="text-base font-medium text-text-secondary">Số lượng câu hỏi</h3>
                <QuestionLevelInput level="level1" levelName="Mức 1: Nhận biết" />
                <QuestionLevelInput level="level2" levelName="Mức 2: Kết nối, sắp xếp" />
                <QuestionLevelInput level="level3" levelName="Mức 3: Vận dụng" />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Tải lên tài liệu (ảnh/PDF)</label>
                <FileUpload 
                    onFileSelect={handleFileSelect} 
                    acceptedTypes="image/jpeg,image/png,application/pdf"
                    isProcessing={isSuggestingTopic}
                />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading} className="w-full">
                Tạo câu hỏi
            </Button>
        </div>
      </Card>
      
      <Card title="Kết quả Câu hỏi" actions={
        generatedQuestions && (
          <>
            <Button variant="secondary" icon={<WordIcon className="w-4 h-4" />}>Xuất Word</Button>
            <Button variant="secondary" onClick={() => handleCopy('all', formatQuestionsToText(generatedQuestions))} icon={copiedStates['all'] ? <CheckIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4" />}>
              {copiedStates['all'] ? 'Đã chép' : 'Sao chép'}
            </Button>
          </>
        )
      }>
        <div className="h-[600px] overflow-y-auto pr-2 -mr-2">
        {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                <svg className="animate-spin h-8 w-8 text-sky-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>AI đang phân tích và tạo câu hỏi...</p>
            </div>
        )}
        {generatedQuestions && (
          <div className="space-y-6">
            {generatedQuestions.map((level, index) => {
                 const mcqs = level.questions.filter(q => q.type === 'multiple_choice');
                 const essays = level.questions.filter(q => q.type === 'essay');
                 return (
                    <div key={index} className="bg-slate-900/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-bold text-sky-400">{level.levelName}</h3>
                             {/* FIX: Added children to the Button component to fix the missing property error. */}
                             <Button variant="secondary" onClick={() => handleCopy(`level-${index}`, formatQuestionsToText([level]))} icon={copiedStates[`level-${index}`] ? <CheckIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4" />}>
                                {copiedStates[`level-${index}`] ? 'Đã chép' : 'Sao chép'}
                             </Button>
                        </div>
                        {mcqs.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold">A. Trắc nghiệm</h4>
                                {mcqs.map((q, qIndex) => (
                                    <div key={qIndex} className="text-sm">
                                        <p>{qIndex + 1}. {q.question}</p>
                                        <ul className="pl-6 mt-1 space-y-1 list-none">
                                            {q.options?.map((option, oIndex) => (
                                                <li key={oIndex} className={option === q.correctAnswer ? 'text-green-400 font-semibold' : ''}>
                                                   {String.fromCharCode(65 + oIndex)}. {option}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                         {essays.length > 0 && (
                            <div className="space-y-3 mt-4">
                                <h4 className="font-semibold">B. Tự luận</h4>
                                {essays.map((q, qIndex) => (
                                     <div key={qIndex} className="text-sm">
                                        <p>{qIndex + 1}. {q.question}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                 )
            })}
          </div>
        )}
        {!isLoading && !generatedQuestions && (
          <div className="flex items-center justify-center h-full text-text-secondary text-center">
            <p>Kết quả câu hỏi sẽ được hiển thị ở đây sau khi bạn tạo.</p>
          </div>
        )}
        </div>
      </Card>
    </div>
  );
};

export default QuestionGenerator;
