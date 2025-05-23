interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

// Function to extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const videoId = getYouTubeVideoId(videoUrl);

  if (videoId) {
    return (
      <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg"
        ></iframe>
      </div>
    );
  }

  // Fallback for non-YouTube URLs or if ID extraction fails
  return (
    <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
      <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-100">
        <div className="text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 lucide lucide-video-off"><path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10Z"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
          <h3 className="text-xl font-semibold mb-2">Video: {title}</h3>
          {videoUrl ? (
            <>
              <p className="text-sm">Could not embed this video. Unsupported URL or format.</p>
              <p className="text-xs mt-2">URL: {videoUrl}</p>
            </>
          ) : (
            <p className="text-sm">No video URL provided.</p>
          )}
        </div>
      </div>
    </div>
  );
}