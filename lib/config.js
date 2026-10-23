// Central configuration for the application.
// Change the app name or university details here to customize for your campus.

export const APP_CONFIG = {
  name: 'Campus Buddy',
  tagline: 'Bennett University student collaboration and resource hub',
  institution: 'Bennett University',
  maintainer: 'Arnav Katyal',
  maintainerRole: 'Tech Head, GDG On Campus at Bennett University',
  allowedEmailDomain: process.env.ALLOWED_EMAIL_DOMAIN || '',
  branches: ['CSE', 'ECE', 'ME', 'Civil', 'BBA', 'Other'],
  semesters: [1, 2, 3, 4, 5, 6, 7, 8],
  postTypes: ['notes', 'PYQ', 'video', 'link', 'other'],
  eventCategories: ['Workshop', 'Hackathon', 'Tech Talk', 'Meetup', 'Club Activity'],
  maxMessageLength: 500,
  maxUploadSizeBytes: 10 * 1024 * 1024, // 10 MB
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif'],
};

export function isAdminEmail(email) {
  if (!email) return false;
  const configured = (process.env.ADMIN_EMAILS || 'arnav@bennett.edu.in,techhead@bennett.edu.in')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return configured.includes(email.toLowerCase());
}
