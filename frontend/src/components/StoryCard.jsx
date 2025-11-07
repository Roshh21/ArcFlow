import React from 'react';

const StoryCard = ({ title, lastPlayed }) => {
  const cardBg = 'bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 rounded-2xl shadow-xl';
  const textPrimary = 'text-white';
  const textSecondary = 'text-zinc-400';
  const buttonBg = 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg';

  return (
    <div className={`p-6 ${cardBg} transition-transform duration-300 hover:scale-105 hover:shadow-2xl`}>
      <h3 className={`text-xl font-semibold mb-2 ${textPrimary}`}>{title}</h3>
      <p className={`text-sm mb-4 ${textSecondary}`}>Last played: {lastPlayed}</p>
      <button
        className={`w-full px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${buttonBg}`}
      >
        Continue Story
      </button>
    </div>
  );
};

export default StoryCard;
