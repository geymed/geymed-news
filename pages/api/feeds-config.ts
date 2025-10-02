import { NextApiRequest, NextApiResponse } from 'next';
import { FEEDS } from '../../lib/feeds';
import { updateFeedConfig, getFeedConfig } from './refresh';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return current feed configuration
    const feedConfig = getFeedConfig();
    res.status(200).json({
      feeds: feedConfig,
      totalFeeds: FEEDS.length,
      enabledFeeds: Object.values(feedConfig).filter(Boolean).length
    });
  } else if (req.method === 'POST') {
    // Update feed configuration
    const { feeds } = req.body;
    
    if (!feeds || typeof feeds !== 'object') {
      return res.status(400).json({ error: 'Invalid feeds configuration' });
    }

    // Validate that all provided feeds exist
    const invalidFeeds = Object.keys(feeds).filter(feed => !FEEDS.includes(feed));
    if (invalidFeeds.length > 0) {
      return res.status(400).json({ 
        error: `Invalid feeds: ${invalidFeeds.join(', ')}` 
      });
    }

    // Update configuration
    updateFeedConfig(feeds);
    const updatedConfig = getFeedConfig();

    res.status(200).json({
      success: true,
      feeds: updatedConfig,
      totalFeeds: FEEDS.length,
      enabledFeeds: Object.values(updatedConfig).filter(Boolean).length
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
