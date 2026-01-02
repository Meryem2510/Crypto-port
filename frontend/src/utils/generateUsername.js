export const generateUsername = (email) => {
  if (!email) return 'User';
  
  // Simple hash function to generate consistent username from email
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to positive number and create username
  const positiveHash = Math.abs(hash);
  const username = `User${positiveHash.toString().slice(0, 6)}`;
  
  return username;
};
