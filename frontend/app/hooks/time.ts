export default function formatTime(date: string | Date) {
    const created = new Date(date);
    const diffSeconds = Math.floor(
      (Date.now() - created.getTime()) / 1000
    );
  
    // Less than 24 hours → relative time
    if (diffSeconds < 86400) {
      if (diffSeconds < 60) return `${diffSeconds}s ago`;
      const minutes = Math.floor(diffSeconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    }
  
    // More than 24 hours → date format (Dec 29)
    return created.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
  
  