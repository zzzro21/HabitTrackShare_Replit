// Test script to verify habit ID mapping
const habitIds = [1, 2, 3, 4, 5, 10, 11, 12, 13, 14];

habitIds.forEach(id => {
  const serverHabitId = id < 10 ? id + 9 : id;
  console.log(`클라이언트 habitId ${id} -> 서버 habitId ${serverHabitId}`);
});
