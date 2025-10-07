import React from 'react';

type PromptCategory = 'prospect' | 'partner' | 'investitori';

interface MicroPrompt {
  id: string;
  text: string;
  category?: PromptCategory;
}

interface MicroPromptsProps {
  prompts: MicroPrompt[];
  onPromptClick: (promptText: string) => void;
  className?: string;
  activeCategory?: PromptCategory | 'all';
}

const MicroPrompts: React.FC<MicroPromptsProps> = ({
  prompts,
  onPromptClick,
  className = '',
  activeCategory = 'all',
}) => {
  const filteredPrompts = React.useMemo(() => {
    if (activeCategory === 'all') {
      return prompts;
    }
    return prompts.filter(prompt => prompt.category === activeCategory);
  }, [prompts, activeCategory]);

  if (!filteredPrompts || filteredPrompts.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 sm:gap-3 ${className}`.trim()}>
      {filteredPrompts.map((prompt, index) => (
        <button
          key={prompt.id}
          onClick={() => onPromptClick(prompt.text)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-base bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 animate-fadeIn hover:scale-105 active:scale-95 touch-manipulation"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {prompt.text}
        </button>
      ))}
    </div>
  );
};

export { MicroPrompts };
export default MicroPrompts;
export type { MicroPrompt, MicroPromptsProps, PromptCategory };
