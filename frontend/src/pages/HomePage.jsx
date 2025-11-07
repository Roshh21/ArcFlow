import React from 'react';

const HomePage = ({ onStartStory }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 
                    bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 
                    transition-colors duration-500">
      <div className="w-full max-w-4xl text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-12 text-white">
          Choose Your Path
        </h1>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Start Your Story Card */}
          <div className="p-6 rounded-2xl shadow-xl backdrop-blur-sm bg-zinc-800/80 border border-zinc-700 
                          transition-transform transform hover:scale-105 duration-300">
            <h2 className="text-2xl font-bold mb-3 text-purple-300">Start Your Story</h2>
            <p className="text-zinc-400 mb-6">
              Start with a custom prompt and let the AI build from there.
            </p>
            <button
              onClick={() => onStartStory('user')}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold 
                         hover:bg-purple-700 transition-colors duration-300 transform hover:scale-105"
            >
              Start
            </button>
          </div>

          {/* Start With AI Card */}
          <div className="p-6 rounded-2xl shadow-xl backdrop-blur-sm bg-zinc-800/80 border border-zinc-700 
                          transition-transform transform hover:scale-105 duration-300">
            <h2 className="text-2xl font-bold mb-3 text-purple-300">Start With AI</h2>
            <p className="text-zinc-400 mb-6">
              Let the AI generate the opening scene based on mood and genre.
            </p>
            <button
              onClick={() => onStartStory('ai')}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold 
                         hover:bg-purple-700 transition-colors duration-300 transform hover:scale-105"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
