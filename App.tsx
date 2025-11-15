
import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import QuestionGenerator from './components/QuestionGenerator';
import ProductFeedback from './components/ProductFeedback';
import TextQuestionGenerator from './components/TextQuestionGenerator';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('question_generator');

  const renderContent = () => {
    switch (activeTab) {
      case 'question_generator':
        return <QuestionGenerator />;
      case 'product_feedback':
        return <ProductFeedback />;
      case 'text_question_generator':
        return <TextQuestionGenerator />;
      default:
        return <QuestionGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="mt-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
