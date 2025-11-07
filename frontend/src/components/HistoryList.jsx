import React from 'react';
import StoryCard from './StoryCard';

const HistoryList = () => {
  // This component will fetch and display a list of StoryCard components
  const dummyStories = [
    { id: 1, title: 'The Quest for the Sunstone', lastPlayed: '1 week ago' },
    { id: 2, title: 'A Knight in the City', lastPlayed: '2 days ago' },
  ];

  return (
    <div className="space-y-4">
      {dummyStories.map(story => (
        <StoryCard key={story.id} title={story.title} lastPlayed={story.lastPlayed} />
      ))}
    </div>
  );
};

export default HistoryList;