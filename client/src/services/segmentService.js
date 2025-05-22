export const fetchSegmentHistory = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/segment/history', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error('Failed to fetch segment history');
  return await res.json();
};
