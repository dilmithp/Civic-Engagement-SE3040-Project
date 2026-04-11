import User from '../models/User.model.js';
import Survey from '../models/survey.model.js';
import Issue from '../models/Issue.model.js';
import GreenInitiative from '../models/GreenInitiative.model.js';

export const getDashboardStats = async () => {
  // KPIs
  const activeUsers = await User.countDocuments();
  const openSurveys = await Survey.countDocuments({ status: 'active' });
  const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
  
  const allSurveys = await Survey.find({}, 'totalVotes title options status');
  const totalVotes = allSurveys.reduce((acc, curr) => acc + (curr.totalVotes || 0), 0);

  // Survey Participation (Top 3 Active Surveys by vote count)
  const surveysWithVotes = allSurveys
    .filter(s => s.status === 'active' && s.options && s.options.length > 0)
    .sort((a,b) => b.totalVotes - a.totalVotes)
    .slice(0, 3)
    .map(s => {
      // Find the leading option to give a percentage metric, or just give participation metric
      const topOption = [...s.options].sort((a, b) => b.voteCount - a.voteCount)[0];
      const percentage = s.totalVotes > 0 ? Math.round((topOption.voteCount / s.totalVotes) * 100) : 0;
      return {
        title: s.title,
        percentage: percentage,
      };
    });

  // Recent Activities
  const recentIssues = await Issue.find().sort({ createdAt: -1 }).limit(3);
  const recentSurveys = await Survey.find().sort({ createdAt: -1 }).limit(3);
  const recentInit = await GreenInitiative.find().sort({ createdAt: -1 }).limit(3);

  const activities = [];
  
  recentIssues.forEach(i => {
    activities.push({
      type: i.status === 'Resolved' ? 'success' : 'warning',
      title: i.status === 'Resolved' ? 'Issue Resolved' : 'New Issue Reported',
      desc: i.title,
      createdAt: i.createdAt
    });
  });

  recentSurveys.forEach(s => {
    activities.push({
      type: 'info',
      title: 'Survey Published',
      desc: s.title,
      createdAt: s.createdAt
    });
  });

  recentInit.forEach(g => {
    activities.push({
      type: 'success',
      title: 'Green Initiative Launch',
      desc: g.title,
      createdAt: g.createdAt
    });
  });

  // Sort unified activities by date descending and pick top 5
  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const topActivities = activities.slice(0, 5).map(act => {
    const hoursAgo = Math.max(1, Math.floor((new Date() - new Date(act.createdAt)) / (1000 * 60 * 60)));
    let timeStr = `${hoursAgo}h ago`;
    if (hoursAgo > 24) {
      timeStr = `${Math.floor(hoursAgo / 24)}d ago`;
    }
    return { ...act, time: timeStr };
  });

  return {
    kpis: {
      activeUsers,
      openSurveys,
      totalVotes,
      resolvedIssues
    },
    activities: topActivities,
    surveysWithVotes
  };
};
