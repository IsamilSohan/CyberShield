interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  return (
    <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
      {/* In a real app, use a proper video player library (e.g., Plyr, Video.js) */}
      {/* For this placeholder, we'll simulate a video player look */}
      <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-100">
        <div className="text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 lucide lucide-play-circle"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16 10,8"/></svg>
          <h3 className="text-xl font-semibold mb-2">Video: {title}</h3>
          <p className="text-sm">This is a placeholder for the video player.</p>
          <p className="text-xs mt-2">Video URL: {videoUrl}</p>
        </div>
      </div>
    </div>
  );
}
