import React from 'react';
import { Share } from 'lucide-react';
import { usePathname } from 'next/navigation';

const TwitterShareButton = ({ customText = "Check out this awesome game!" }) => {
  const pathname = usePathname();
  
  // Get the full URL using window.location only on client side
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}${pathname}`;
      
      // Encode the URL and text for Twitter intent
      const shareText = encodeURIComponent(customText);
      const shareUrl = encodeURIComponent(fullUrl);
      
      return `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
    }
    return '#';
  };

  const handleShare = () => {
    const intentUrl = getShareUrl();
    // Open in a new window with specified dimensions
    window.open(
      intentUrl,
      'TwitterShare',
      'width=550,height=420,scrollbars=yes,centerscreen'
    );
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <Share className="w-4 h-4" />
      Share on Twitter
    </button>
  );
};

export default TwitterShareButton;